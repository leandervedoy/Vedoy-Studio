/**
 * Experimental field-level content encryption for messages. NOT a replacement
 * for Signal Protocol, a reviewed end-to-end messenger, or production crypto.
 * Each segment requires its own secret. Key distribution and secure storage
 * must be implemented by an audited client-side E2EE protocol.
 */
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

const MAX_PART_BYTES = 32 * 1024;
const MAX_PARTS = 16;
const PART_NAME = /^[a-zA-Z0-9_-]{1,40}$/;
const MESSAGE_ID = /^[a-zA-Z0-9_-]{1,120}$/;
const ALG = 'A256GCM-HKDF-SHA256';
const VERSION = 1;

function checkSecret(secret) {
  if (!Buffer.isBuffer(secret) || secret.length !== 32) throw new Error('segment_secret_must_be_32_bytes');
}
function context(conversationId, messageId, partId) {
  if (typeof conversationId !== 'string' || !MESSAGE_ID.test(conversationId) ||
      typeof messageId !== 'string' || !MESSAGE_ID.test(messageId) ||
      typeof partId !== 'string' || !PART_NAME.test(partId)) throw new Error('invalid_context');
  return Buffer.from(JSON.stringify(['vedoy-shield-segment-v1', conversationId, messageId, partId]));
}
function decodeCanonical(value, size, label) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid_' + label);
  const buf = Buffer.from(value, 'base64url');
  if (buf.length !== size || buf.toString('base64url') !== value) throw new Error('invalid_' + label);
  return buf;
}
function derivedKey(secret, salt, associated) {
  return Buffer.from(hkdfSync('sha256', secret, salt, associated, 32));
}
export function createSegmentSecret() {
  return randomBytes(32);
}
export function sealSegment({ conversationId, messageId, partId, text, secret }) {
  checkSecret(secret);
  const aad = context(conversationId, messageId, partId);
  if (typeof text !== 'string' || Buffer.byteLength(text, 'utf8') > MAX_PART_BYTES)
    throw new Error('invalid_part_text');
  const salt = randomBytes(32);
  const nonce = randomBytes(12);
  const key = derivedKey(secret, salt, aad);
  const cipher = createCipheriv('aes-256-gcm', key, nonce, { authTagLength: 16 });
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  key.fill(0);
  return Object.freeze({
    v: VERSION,
    alg: ALG,
    conversationId,
    messageId,
    partId,
    salt: salt.toString('base64url'),
    nonce: nonce.toString('base64url'),
    ciphertext: ciphertext.toString('base64url'),
    tag: tag.toString('base64url')
  });
}
export function openSegment(segment, secret, expectedContext) {
  checkSecret(secret);
  if (segment === null || typeof segment !== 'object' || Array.isArray(segment) ||
      segment.v !== VERSION || segment.alg !== ALG ||
      typeof expectedContext !== 'object' || expectedContext === null) throw new Error('invalid_segment');
  const { conversationId, messageId, partId } = expectedContext;
  if (segment.conversationId !== conversationId || segment.messageId !== messageId ||
      segment.partId !== partId) throw new Error('context_mismatch');
  const aad = context(conversationId, messageId, partId);
  const salt = decodeCanonical(segment.salt, 32, 'salt');
  const nonce = decodeCanonical(segment.nonce, 12, 'nonce');
  const tag = decodeCanonical(segment.tag, 16, 'tag');
  if (typeof segment.ciphertext !== 'string' || !/^[A-Za-z0-9_-]*$/.test(segment.ciphertext) ||
      segment.ciphertext.length > 50000) throw new Error('invalid_ciphertext');
  const ciphertext = Buffer.from(segment.ciphertext, 'base64url');
  if (ciphertext.length > MAX_PART_BYTES || ciphertext.toString('base64url') !== segment.ciphertext)
    throw new Error('invalid_ciphertext');
  const key = derivedKey(secret, salt, aad);
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, nonce, { authTagLength: 16 });
    decipher.setAAD(aad);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } finally { key.fill(0); }
}
export function sealMessageParts(conversationId, messageId, entries) {
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > MAX_PARTS) throw new Error('invalid_parts_count');
  const names = new Set();
  return entries.map(({ partId, text, secret }) => {
    if (names.has(partId)) throw new Error('duplicate_part');
    names.add(partId);
    return sealSegment({ conversationId, messageId, partId, text, secret });
  });
}
