use vedoy_shield_core::{
    chain::SessionChains,
    hybrid::{initiate, RecipientPrivate, SenderIdentity},
    identity::{IdentityDocument, IdentityProofing, ProofingRequest, UnconfiguredProofing},
    json::{capabilities, encode_bounded, parse_bounded},
    storage::EncryptedAtomicStore,
    vault::{SecureKeyVault, UnavailableVault},
    wordforge::{decrypt_message, encrypt_message, WordEnvelope},
};
const PASSWORD2: &str = "long-second-password-not-used-in-production";
const PIN: &str = "728194";
#[test]
fn authenticated_hybrid_agreement_and_message() {
    let (bob, bundle) = RecipientPrivate::generate();
    let alice_id = SenderIdentity::generate();
    let (invite, alice_root) = initiate(&bundle, &bob.identity_public(), &alice_id, "chat-a").unwrap();
    let bob_root = bob.accept(&invite, &bundle, &alice_id.identity_public()).unwrap();
    let mut alice = SessionChains::initiator(&alice_root).unwrap();
    let mut bob_chains = SessionChains::responder(&bob_root).unwrap();
    let a = alice.send.prepare().unwrap();
    let b = bob_chains.receive.prepare().unwrap();
    let plaintext = "Hei, Vedoy Shield! 🔐";
    let packet = encrypt_message(plaintext, "chat-a", a.sequence, &a.key).unwrap();
    assert_eq!(decrypt_message(&packet, "chat-a", b.sequence, &b.key).unwrap(), plaintext);
    alice.send.commit(a).unwrap();
    bob_chains.receive.commit(b).unwrap();
    assert_eq!(alice.send.sequence(), 1);
}
#[test]
fn refuses_untrusted_sender_and_recipient() {
    let (bob, bundle) = RecipientPrivate::generate();
    let sender = SenderIdentity::generate();
    assert!(initiate(&bundle, &[3u8; 32], &sender, "chat-a").is_err());
    let (invite, _) = initiate(&bundle, &bob.identity_public(), &sender, "chat-a").unwrap();
    assert!(bob.accept(&invite, &bundle, &[8u8; 32]).is_err());
    assert!(bob.accept(&invite, &bundle, &sender.identity_public()).is_ok());
}
#[test]
fn refuses_tampered_sender_signature_and_context() {
    let (bob, bundle) = RecipientPrivate::generate();
    let sender = SenderIdentity::generate();
    let (mut invite, _) = initiate(&bundle, &bob.identity_public(), &sender, "chat-a").unwrap();
    invite.chat_id = "chat-b".to_string();
    assert!(bob.accept(&invite, &bundle, &sender.identity_public()).is_err());
    invite.chat_id = "chat-a".to_string();
    invite.sender_signature[0] ^= 1;
    assert!(bob.accept(&invite, &bundle, &sender.identity_public()).is_err());
}
#[test]
fn rejects_tampered_wordforge_envelope() {
    let (bob, bundle) = RecipientPrivate::generate();
    let sender = SenderIdentity::generate();
    let (_, root) = initiate(&bundle, &bob.identity_public(), &sender, "chat-a").unwrap();
    let chain = SessionChains::initiator(&root).unwrap();
    let step = chain.send.prepare().unwrap();
    let mut env = encrypt_message("Hei der!", "chat-a", step.sequence, &step.key).unwrap();
    assert!(decrypt_message(&env, "chat-b", step.sequence, &step.key).is_err());
    env.ciphertext[0] ^= 1;
    assert!(decrypt_message(&env, "chat-a", step.sequence, &step.key).is_err());
}
#[test]
fn json_bounded_and_versioned() {
    let (bob, bundle) = RecipientPrivate::generate();
    let sender = SenderIdentity::generate();
    let (_, root) = initiate(&bundle, &bob.identity_public(), &sender, "chat-a").unwrap();
    let chain = SessionChains::initiator(&root).unwrap();
    let step = chain.send.prepare().unwrap();
    let env = encrypt_message("Hei!", "chat-a", 0, &step.key).unwrap();
    let bytes = encode_bounded(&env).unwrap();
    let parsed: WordEnvelope = parse_bounded(&bytes).unwrap();
    assert_eq!(parsed.version, 3);
    assert_eq!(decrypt_message(&parsed, "chat-a", 0, &step.key).unwrap(), "Hei!");
    assert_eq!(capabilities().core_version, "0.3.0");
    assert!(!capabilities().production_ready);
}
#[test]
fn absent_secure_key_vault_and_id_provider_fail_closed() {
    let vault = UnavailableVault;
    assert!(vault.store("id1", &[4; 32]).is_err());
    assert!(vault.load("id1").is_err());
    let provider = UnconfiguredProofing;
    assert!(provider.start(&ProofingRequest {
        account_pseudonym: "account123".to_string(),
        request_nonce: "nonce-dummy".to_string(),
        document_type: IdentityDocument::Passport,
    }).is_err());
}
#[cfg(unix)]
fn test_store() -> (EncryptedAtomicStore, std::path::PathBuf) {
    use rand_core::{OsRng, RngCore};
    let mut random = [0u8; 8];
    OsRng.fill_bytes(&mut random);
    let path = std::env::temp_dir().join(format!("vedoy-shield-test-{}", u64::from_be_bytes(random)));
    (EncryptedAtomicStore::new(&path, "ratchet.json").unwrap(), path)
}
#[test]
#[cfg(unix)]
fn encrypted_snapshot_roundtrip_wrong_pin_and_revision_conflict() {
    let (store, dir) = test_store();
    let plain = b"secret ratchet bytes: never stored unencrypted";
    assert_eq!(store.save(PASSWORD2, PIN, "chat-a", 0, plain).unwrap(), 1);
    let disk = std::fs::read(dir.join("ratchet.json")).unwrap();
    assert!(!disk.windows(plain.len()).any(|x| x == plain));
    let loaded = store.load(PASSWORD2, PIN, "chat-a").unwrap();
    assert_eq!(&*loaded.plaintext, plain);
    assert_eq!(loaded.revision, 1);
    assert!(store.load(PASSWORD2, "000000", "chat-a").is_err());
    assert!(store.load(PASSWORD2, PIN, "chat-b").is_err());
    assert!(store.save(PASSWORD2, PIN, "chat-a", 0, b"replay state").is_err());
    assert_eq!(store.save(PASSWORD2, PIN, "chat-a", 1, b"next state").unwrap(), 2);
    assert_eq!(&*store.load(PASSWORD2, PIN, "chat-a").unwrap().plaintext, b"next state");
    std::fs::remove_dir_all(dir).unwrap();
}
#[test]
fn secure_messaging_ratchet_fails_closed_until_reviewed_backend_is_available() {
    use vedoy_shield_core::ratchet::PostQuantumRatchet;
    assert!(PostQuantumRatchet::from_encrypted_snapshot(vec![1, 2, 3]).is_err());
}

#[test]
fn sealed_payload_authenticates_context_key_ciphertext_and_version() {
    use vedoy_shield_core::sealed::{open_payload, seal_payload};
    let key = [42u8; 32];
    let data = b"research data: no real keys";
    let envelope = seal_payload(&key, b"example/account-a", data).unwrap();
    assert_eq!(open_payload(&key, b"example/account-a", &envelope).unwrap(), data);
    assert!(open_payload(&key, b"example/account-b", &envelope).is_err());
    assert!(open_payload(&[2u8; 32], b"example/account-a", &envelope).is_err());
    let mut modified = envelope.clone();
    modified.ciphertext[0] ^= 1;
    assert!(open_payload(&key, b"example/account-a", &modified).is_err());
    let mut wrong_version = envelope.clone();
    wrong_version.version = 2;
    assert!(open_payload(&key, b"example/account-a", &wrong_version).is_err());
    assert!(seal_payload(&key, b"", data).is_err());
    assert!(seal_payload(&key, b"example/account-a", &vec![0; 1024 * 1024 + 1]).is_err());
}

#[test]
fn sealed_payload_nonce_is_fresh_and_json_roundtrips() {
    use vedoy_shield_core::sealed::{open_payload, seal_payload, SealedPayload};
    let key = [91u8; 32];
    let first = seal_payload(&key, b"example/file", b"hello").unwrap();
    let second = seal_payload(&key, b"example/file", b"hello").unwrap();
    assert_ne!(first.nonce, second.nonce);
    let serialized = encode_bounded(&first).unwrap();
    let restored: SealedPayload = parse_bounded(&serialized).unwrap();
    assert_eq!(open_payload(&key, b"example/file", &restored).unwrap(), b"hello");
}

#[test]
#[cfg(unix)]
fn encrypted_invite_replay_ledger_rejects_duplicates_and_invalid_auth() {
    use vedoy_shield_core::replay::{
        initialize_local_ledger, LocalEncryptedReplayLedger,
    };
    let (store, dir) = test_store();
    let (bob, bundle) = RecipientPrivate::generate();
    let sender = SenderIdentity::generate();
    let (invite, _) = initiate(&bundle, &bob.identity_public(), &sender, "chat-a").unwrap();

    // A missing ledger must block guarded acceptance.
    let mut guard = LocalEncryptedReplayLedger::new(&store, PASSWORD2, PIN, "account-a");
    assert!(bob.accept_guarded(&invite, &bundle, &sender.identity_public(), &mut guard).is_err());

    initialize_local_ledger(&store, PASSWORD2, PIN, "account-a").unwrap();
    let mut guard = LocalEncryptedReplayLedger::new(&store, PASSWORD2, PIN, "account-a");

    // Tampered or impersonated invites MUST NOT reach the consume operation.
    let mut tampered = invite.clone();
    tampered.sender_signature[0] ^= 1;
    assert!(bob.accept_guarded(&tampered, &bundle, &sender.identity_public(), &mut guard).is_err());
    assert!(bob.accept_guarded(&invite, &bundle, &[7u8; 32], &mut guard).is_err());

    // First valid authenticated acceptance consumes the invite atomically.
    assert!(bob.accept_guarded(&invite, &bundle, &sender.identity_public(), &mut guard).is_ok());
    assert!(bob.accept_guarded(&invite, &bundle, &sender.identity_public(), &mut guard).is_err());

    // New guard after restart must see the same encrypted replay state.
    let mut reopened = LocalEncryptedReplayLedger::new(&store, PASSWORD2, PIN, "account-a");
    assert!(bob.accept_guarded(&invite, &bundle, &sender.identity_public(), &mut reopened).is_err());

    // Wrong credentials and scope must fail closed.
    let mut wrong_pin = LocalEncryptedReplayLedger::new(&store, PASSWORD2, "000000", "account-a");
    assert!(bob.accept_guarded(&invite, &bundle, &sender.identity_public(), &mut wrong_pin).is_err());
    let mut wrong_scope = LocalEncryptedReplayLedger::new(&store, PASSWORD2, PIN, "account-b");
    assert!(bob.accept_guarded(&invite, &bundle, &sender.identity_public(), &mut wrong_scope).is_err());
    std::fs::remove_dir_all(dir).unwrap();
}

#[test]
#[cfg(unix)]
fn local_invite_ledger_rejects_reinitialization_and_storage_failure() {
    use vedoy_shield_core::replay::{initialize_local_ledger, LocalEncryptedReplayLedger};
    let (store, dir) = test_store();
    let (bob, bundle) = RecipientPrivate::generate();
    let sender = SenderIdentity::generate();
    let (invite, _) = initiate(&bundle, &bob.identity_public(), &sender, "chat-a").unwrap();
    initialize_local_ledger(&store, PASSWORD2, PIN, "account-a").unwrap();
    assert!(initialize_local_ledger(&store, PASSWORD2, PIN, "account-a").is_err());
    // Storage unavailable: no root key should be returned.
    std::fs::remove_dir_all(&dir).unwrap();
    let mut guard = LocalEncryptedReplayLedger::new(&store, PASSWORD2, PIN, "account-a");
    assert!(bob.accept_guarded(&invite, &bundle, &sender.identity_public(), &mut guard).is_err());
}
