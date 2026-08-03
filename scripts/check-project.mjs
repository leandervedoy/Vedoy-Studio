import fs from "node:fs";
import path from "node:path";

const required = [
  "package.json",
  "app/layout.tsx",
  "app/(marketing)/page.tsx",
  "app/studio/page.tsx",
  "app/api/bookings/route.ts",
  "app/api/domains/search/route.ts",
  "lib/repository.ts",
  "data/schema.sql",
  "packages/booking/package.json",
  "packages/booking/src/index.ts"
];

let failed = false;
for (const file of required) {
  const absolute = path.join(process.cwd(), file);
  if (!fs.existsSync(absolute)) {
    console.error(`✗ Mangler: ${file}`);
    failed = true;
  } else {
    console.log(`✓ ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
if (!packageJson.workspaces?.includes("packages/*")) {
  console.error("✗ package.json mangler workspace for packages/*");
  failed = true;
}

if (failed) process.exit(1);
console.log("\nProsjektstrukturen ser komplett ut.");
