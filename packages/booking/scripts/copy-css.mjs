import { copyFile, mkdir } from "node:fs/promises";
const source = new URL("../src/styles.css", import.meta.url);
const destination = new URL("../dist/styles.css", import.meta.url);
await mkdir(new URL("../dist", import.meta.url), { recursive: true });
await copyFile(source, destination);
