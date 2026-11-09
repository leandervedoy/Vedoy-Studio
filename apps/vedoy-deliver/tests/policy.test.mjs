import {test} from "node:test";
import assert from "node:assert/strict";
import {eligibleForTask,validModeForAge,nextTaskState,money} from "../lib/policy.ts";
test("no car deliveries for minors",()=>assert.equal(validModeForAge("15_17","car"),false));
test("minors cannot take adult-only deliveries",()=>{
 const courier={age_band:"15_17",mode:"bike",status:"approved"};
 assert.equal(eligibleForTask(courier,{min_age:18,transport:"bike",minor_approved:true,status:"open"}),false);
});
test("minor-eligible routes require manual safety clearance",()=>{
 const courier={age_band:"15_17",mode:"bike",status:"approved"};
 assert.equal(eligibleForTask(courier,{min_age:15,transport:"bike",minor_approved:false,status:"open"}),false);
 assert.equal(eligibleForTask(courier,{min_age:15,transport:"bike",minor_approved:true,status:"open"}),true);
});
test("pending couriers and wrong vehicles cannot claim",()=>{
 assert.equal(eligibleForTask({age_band:"18_20",mode:"bike",status:"pending"},{min_age:18,transport:"bike",minor_approved:false,status:"open"}),false);
 assert.equal(eligibleForTask({age_band:"18_20",mode:"bike",status:"approved"},{min_age:18,transport:"car",minor_approved:false,status:"open"}),false);
});
test("only claimed and picked-up can progress",()=>{
 assert.equal(nextTaskState("open"),null);
 assert.equal(nextTaskState("claimed"),"picked_up");
 assert.equal(nextTaskState("picked_up"),"delivered");
 assert.equal(nextTaskState("delivered"),null);
});
test("price display uses NOK",()=>assert.ok(money(8500).includes("85")));
