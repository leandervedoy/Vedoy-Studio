//! Local, encrypted, fail-closed invite replay ledger for research builds.
//! This is per-account/per-device only; multi-device global replay prevention
//! remains a hard production blocker. Never store a ledger in a shared folder.
use crate::{
    hybrid::InviteReplayGuard,
    storage::EncryptedAtomicStore,
    ShieldError, ShieldResult,
};
use serde::{Deserialize, Serialize};

const LEDGER_VERSION: u8 = 1;
const MAX_CONSUMED_INVITES: usize = 20_000;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct LedgerSnapshot {
    version: u8,
    consumed_ids: Vec<[u8; 16]>,
}

/// Explicit one-time setup. Rejects overwriting an existing ledger.
/// A caller must use a dedicated private EncryptedAtomicStore and unique
/// account-specific scope; resetting this file defeats local replay protection.
pub fn initialize_local_ledger(
    store: &EncryptedAtomicStore,
    password2: &str,
    pin: &str,
    account_scope: &str,
) -> ShieldResult<()> {
    let state = LedgerSnapshot {
        version: LEDGER_VERSION,
        consumed_ids: Vec::new(),
    };
    store.save_json(password2, pin, account_scope, 0, &state)?;
    Ok(())
}

/// Holds borrowed credentials only for the duration of the guarded operation.
/// Platform hardware-backed key protection is still required for production.
pub struct LocalEncryptedReplayLedger<'a> {
    store: &'a EncryptedAtomicStore,
    password2: &'a str,
    pin: &'a str,
    account_scope: &'a str,
}
impl<'a> LocalEncryptedReplayLedger<'a> {
    pub fn new(
        store: &'a EncryptedAtomicStore,
        password2: &'a str,
        pin: &'a str,
        account_scope: &'a str,
    ) -> Self {
        Self { store, password2, pin, account_scope }
    }
}
impl InviteReplayGuard for LocalEncryptedReplayLedger<'_> {
    fn consume_authenticated_invite(&mut self, invite_id: &[u8; 16]) -> ShieldResult<()> {
        let (revision, mut state): (u64, LedgerSnapshot) =
            self.store.load_json(self.password2, self.pin, self.account_scope)?;
        if state.version != LEDGER_VERSION || state.consumed_ids.len() > MAX_CONSUMED_INVITES {
            return Err(ShieldError::InvalidFormat);
        }
        if state.consumed_ids.iter().any(|existing| existing == invite_id) {
            return Err(ShieldError::AuthenticationFailed);
        }
        if state.consumed_ids.len() == MAX_CONSUMED_INVITES {
            // No silent eviction: old invite IDs must not become valid again.
            return Err(ShieldError::LimitExceeded);
        }
        state.consumed_ids.push(*invite_id);
        // Compare-and-swap atomic write: conflicting concurrent operations fail
        // closed rather than accepting a replay. No usable root is returned
        // until this write has been durably committed.
        self.store.save_json(
            self.password2, self.pin, self.account_scope, revision, &state
        )?;
        Ok(())
    }
}
