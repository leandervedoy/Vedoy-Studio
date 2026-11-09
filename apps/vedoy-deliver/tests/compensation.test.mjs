import test from "node:test";
import assert from "node:assert/strict";
import {tierForAge,calculateCompensation} from "../lib/compensation.ts";
test("age boundaries",()=>{
 assert.equal(tierForAge(14),null);
 assert.equal(tierForAge(15),"15_16");
 assert.equal(tierForAge(16),"15_16");
 assert.equal(tierForAge(17),"17");
 assert.equal(tierForAge(18),"18_plus");
});
test("hourly wage and distinct coin rewards",()=>{
 assert.deepEqual(calculateCompensation("17",180,6,4),{grossWageNok:480,coins:160});
 assert.deepEqual(calculateCompensation("15_16",60,3,2),{grossWageNok:150,coins:40});
 assert.deepEqual(calculateCompensation("18_plus",60,2,1),{grossWageNok:170,coins:95});
});
test("invalid counts rejected",()=>assert.throws(()=>calculateCompensation("17",60,-1,0)));
