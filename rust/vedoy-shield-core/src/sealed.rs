//! Standard authenticated data-at-rest envelope, backed by RustCrypto's
//! XChaCha20-Poly1305 implementation. This is NOT a messenger ratchet or a
//! post-quantum key exchange. Callers are responsible for securely obtaining,
//! storing, rotating, and destroying independent 256-bit symmetric keys.
use crate::{ShieldError, ShieldResult};
use chacha20poly1305::{
    aead::{Aead, KeyInit, Payload},
    XChaCha20Poly1305, XNonce,
};
use rand_core::{OsRng, RngCore};
use serde::{Deserialize, Serialize};

const DOMAIN: &[u8] = b"vedoy/shield/sealed-payload/v1";
// Keep the JSON-serialized byte array below the 2 MiB parser limit.
const MAX_PLAINTEXT: usize = 256 * 1024;
const TAG_BYTES: usize = 16;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SealedPayload {
    pub version: u8,
    pub nonce: [u8; 24],
    pub ciphertext: Vec<u8>,
}

fn associated_data(context: &[u8]) -> ShieldResult<Vec<u8>> {
    if context.is_empty() || context.len() > 256 {
        return Err(ShieldError::InvalidFormat);
    }
    let mut data = Vec::with_capacity(DOMAIN.len() + 4 + context.len());
    data.extend_from_slice(DOMAIN);
    data.extend_from_slice(&(context.len() as u32).to_be_bytes());
    data.extend_from_slice(context);
    Ok(data)
}

/// A standalone encryption building block for local data, never a substitute
/// for authenticated key exchange, forward secrecy, or device verification.
pub fn seal_payload(
    key: &[u8; 32],
    context: &[u8],
    plaintext: &[u8],
) -> ShieldResult<SealedPayload> {
    if plaintext.len() > MAX_PLAINTEXT {
        return Err(ShieldError::LimitExceeded);
    }
    let aad = associated_data(context)?;
    let cipher = XChaCha20Poly1305::new_from_slice(key)
        .map_err(|_| ShieldError::InvalidFormat)?;
    let mut nonce = [0u8; 24];
    OsRng.fill_bytes(&mut nonce);
    let ciphertext = cipher
        .encrypt(XNonce::from_slice(&nonce), Payload { msg: plaintext, aad: &aad })
        .map_err(|_| ShieldError::AuthenticationFailed)?;
    Ok(SealedPayload { version: 1, nonce, ciphertext })
}

/// Authentication failures never expose partial plaintext.
pub fn open_payload(
    key: &[u8; 32],
    context: &[u8],
    envelope: &SealedPayload,
) -> ShieldResult<Vec<u8>> {
    if envelope.version != 1 {
        return Err(ShieldError::InvalidFormat);
    }
    if envelope.ciphertext.len() < TAG_BYTES
        || envelope.ciphertext.len() > MAX_PLAINTEXT + TAG_BYTES
    {
        return Err(ShieldError::LimitExceeded);
    }
    let aad = associated_data(context)?;
    let cipher = XChaCha20Poly1305::new_from_slice(key)
        .map_err(|_| ShieldError::InvalidFormat)?;
    cipher
        .decrypt(XNonce::from_slice(&envelope.nonce), Payload {
            msg: &envelope.ciphertext,
            aad: &aad,
        })
        .map_err(|_| ShieldError::AuthenticationFailed)
}
