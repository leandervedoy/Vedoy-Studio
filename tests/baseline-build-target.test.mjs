import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

test("public browser build targets Baseline Widely Available without ES5 fallback", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.deepEqual(pkg.browserslist, ["baseline widely available"]);
  assert.ok(!JSON.stringify(pkg.browserslist).includes("ie 11"));
  assert.ok(!JSON.stringify(pkg.browserslist).includes("es5"));
});
