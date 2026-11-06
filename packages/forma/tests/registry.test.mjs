import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {formaVersion,initForma} from "../index.js";

const src=readFileSync(new URL("../../../lib/forma-components.ts",import.meta.url),"utf8");
const css=readFileSync(new URL("../styles.css",import.meta.url),"utf8");
const packageFile=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
const start=src.indexOf("export const formaExamples: FormaExample[] = ");
const end=src.indexOf(";\nexport const formaCategories =",start);
assert.ok(start>=0&&end>start,"Forma example registry should be present");
const examples=JSON.parse(src.slice(start+"export const formaExamples: FormaExample[] = ".length,end));

test("library provides exactly 50 unique UI examples",()=>{
 assert.equal(examples.length,50);
 assert.equal(new Set(examples.map(x=>x.id)).size,50);
 const categories=Object.groupBy?Object.groupBy(examples,x=>x.category):examples.reduce((a,x)=>((a[x.category]??=[]).push(x),a),{});
 assert.deepEqual(Object.keys(categories).sort(),["Innhold","Media og data","Navigasjon","Skjemaer","Tilbakemelding"].sort());
 for(const example of examples){
  assert.ok(example.html.trim().startsWith("<"),"Missing HTML for "+example.id);
  assert.ok(example.title.trim().length>2,"Missing title for "+example.id);
 }
});
test("core responsive and accessible CSS patterns exist",()=>{
 for(const needle of ["--vf-brand",".vf-navbar",".vf-menu-stage",".vf-gallery",".vf-bento-grid",".vf-form",".vf-modal","@container","@media (max-width:700px)","prefers-reduced-motion"]){
  assert.ok(css.includes(needle),"CSS missing "+needle);
 }
});
test("package remains private until publishing is approved",()=>{
 assert.equal(packageFile.private,true);
 assert.equal(packageFile.version,formaVersion);
 assert.equal(packageFile.exports["./styles.css"],"./styles.css");
 assert.equal(typeof initForma,"function");
 assert.equal(typeof initForma(null),"function");
});
