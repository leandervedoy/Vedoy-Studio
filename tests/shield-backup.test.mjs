import { test } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

test("Shield encrypted backup round-trips and rejects tampering", async () => {
  const dir = await mkdtemp(join(tmpdir(), "shield-backup-test-"));
  try {
    const original = join(dir, "original.txt");
    const encrypted = join(dir, "original.shield");
    const recovered = join(dir, "recovered.txt");
    const tampered = join(dir, "tampered.shield");
    await writeFile(original, "test data - not a production secret");
    const env = {...process.env, SHIELD_BACKUP_PASSPHRASE: "unit-test-password-only-not-a-real-secret-123456"};
    execFileSync(process.execPath, ["scripts/shield-backup.mjs", "encrypt", original, encrypted], {env});
    execFileSync(process.execPath, ["scripts/shield-backup.mjs", "decrypt", encrypted, recovered], {env});
    assert.deepEqual(await readFile(original), await readFile(recovered));
    const bytes = await readFile(encrypted);
    bytes[bytes.length - 1] ^= 1;
    await writeFile(tampered, bytes);
    assert.throws(() => execFileSync(process.execPath, ["scripts/shield-backup.mjs", "decrypt", tampered, join(dir, "not-written")], {env, stdio:"pipe"}));
  } finally {
    await rm(dir, {recursive:true,force:true});
  }
});
