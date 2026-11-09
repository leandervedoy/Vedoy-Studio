#!/usr/bin/env node
// Vedoy Shield backup envelope v1. Uses Node's audited platform crypto primitives;
// NOT the experimental Vedoy Shield post-quantum transport core.
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from "node:crypto";

const magic = Buffer.from("VEDOY-SHIELD-BACKUP-v1\n", "utf8");
const [mode, input, output] = process.argv.slice(2);
const secret = process.env.SHIELD_BACKUP_PASSPHRASE;
if (!["encrypt", "decrypt"].includes(mode) || !input || !output) {
  console.error("Usage: node scripts/shield-backup.mjs encrypt|decrypt INPUT OUTPUT");
  process.exit(2);
}
if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
  console.error("SHIELD_BACKUP_PASSPHRASE must be configured (at least 32 UTF-8 bytes).");
  process.exit(2);
}
if (input === output) throw new Error("Input and output must differ.");
const keyFor = salt => pbkdf2Sync(secret, salt, 600_000, 32, "sha256");
const plainOrEnvelope = await readFile(input);
let outputBytes;
if (mode === "encrypt") {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFor(salt), iv);
  cipher.setAAD(magic);
  const ciphertext = Buffer.concat([cipher.update(plainOrEnvelope), cipher.final()]);
  outputBytes = Buffer.concat([magic, salt, iv, cipher.getAuthTag(), ciphertext]);
} else {
  if (plainOrEnvelope.length < magic.length + 16 + 12 + 16 ||
      !plainOrEnvelope.subarray(0, magic.length).equals(magic)) {
    throw new Error("Invalid Shield backup envelope.");
  }
  let pos = magic.length;
  const salt = plainOrEnvelope.subarray(pos, pos += 16);
  const iv = plainOrEnvelope.subarray(pos, pos += 12);
  const tag = plainOrEnvelope.subarray(pos, pos += 16);
  const decipher = createDecipheriv("aes-256-gcm", keyFor(salt), iv);
  decipher.setAAD(magic);
  decipher.setAuthTag(tag);
  outputBytes = Buffer.concat([decipher.update(plainOrEnvelope.subarray(pos)), decipher.final()]);
}
await writeFile(output, outputBytes, { flag: "wx", mode: 0o600 });
console.log(mode === "encrypt" ? "Encrypted backup created." : "Authenticated backup decrypted.");
