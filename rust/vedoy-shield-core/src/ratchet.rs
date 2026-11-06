//! Explicitly unavailable messaging ratchet.
//!
//! The previous optional third-party integration was removed. A supported,
//! independently reviewed, license-compatible implementation MUST replace
//! this interface before enabling end-to-end messaging. Never silently
//! downgrade to a symmetric chain or a static session key.
use crate::{chain::MessageKey, hybrid::HybridRoot, ShieldError, ShieldResult};

/// No active implementation is shipped. Keeping the API fail-closed prevents
/// callers from accidentally treating the standalone AEAD as a ratchet.
pub struct PostQuantumRatchet;
pub struct PreparedSend {
    pub next_state: Vec<u8>,
    pub chunk: Vec<u8>,
    pub key: MessageKey,
}
pub struct PreparedReceive {
    pub next_state: Vec<u8>,
    pub key: MessageKey,
}
impl PostQuantumRatchet {
    pub(crate) fn encrypted_snapshot_bytes(&self) -> Vec<u8> {
        Vec::new()
    }
    pub fn from_encrypted_snapshot(_state: Vec<u8>) -> ShieldResult<Self> {
        Err(ShieldError::RatchetUnavailable)
    }
    pub fn initialize(_root: &HybridRoot, _sender: bool) -> ShieldResult<Self> {
        Err(ShieldError::RatchetUnavailable)
    }
    pub fn prepare_send(&self) -> ShieldResult<PreparedSend> {
        Err(ShieldError::RatchetUnavailable)
    }
    pub fn prepare_receive(&self, _chunk: &[u8]) -> ShieldResult<PreparedReceive> {
        Err(ShieldError::RatchetUnavailable)
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn never_downgrades_to_unratcheted_messages() {
        assert!(matches!(
            PostQuantumRatchet::from_encrypted_snapshot(vec![1, 2, 3]),
            Err(ShieldError::RatchetUnavailable)
        ));
    }
}
