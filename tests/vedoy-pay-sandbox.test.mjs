import test from "node:test";
import assert from "node:assert/strict";
import { applySandboxAction as act,newSandbox,isSandboxState } from "../lib/vedoy-pay/sandbox.mjs";
const a=(type,fields={},n=1)=>({type,idempotencyKey:"sim_"+String(n).padStart(15,"0"),...fields});
const design={color:"fjord",pattern:"waves",label:"Vedoy Pay"};
test("sandbox is isolated and starts with no value",()=>{
  const s=newSandbox();
  assert.equal(isSandboxState(s),true);
  assert.equal(s.balanceOre,0);
  assert.equal(s.accountOpened,false);
  assert.deepEqual(s.cards,[]);
});
test("demo account requires explicit opening and keeps monetary simulation separate",()=>{
  let s=newSandbox();
  assert.throws(()=>act(s,a("FUND_WALLET",{amountOre:10000},2)));
  s=act(s,a("OPEN_ACCOUNT",{},1));
  s=act(s,a("FUND_WALLET",{amountOre:500000},2));
  assert.equal(s.balanceOre,500000);
  assert.equal(s.cards.length,0);
});
test("sandbox cannot add negative funds or unapproved extras",()=>{
  let s=act(newSandbox(),a("OPEN_ACCOUNT",{},1));
  assert.throws(()=>act(s,a("FUND_WALLET",{amountOre:-100},2)));
  assert.throws(()=>act(s,{...a("FUND_WALLET",{amountOre:100},2),pan:"4242"}));
  assert.throws(()=>act(s,a("FUND_WALLET",{amountOre:10000001},2)));
  assert.equal(s.balanceOre,0);
});
test("virtual card can pay but simulated physical card order cannot",()=>{
  let s=act(newSandbox(),a("OPEN_ACCOUNT",{},1));
  s=act(s,a("FUND_WALLET",{amountOre:100000},2));
  s=act(s,a("ISSUE_CARD",{cardType:"virtual",design},3));
  s=act(s,a("ISSUE_CARD",{cardType:"physical",design},4));
  assert.equal(s.cards.length,2);
  assert.equal(s.cards[1].status,"not_shipped");
  assert.throws(()=>act(s,a("PAY",{cardId:s.cards[1].id,amountOre:12000,scenario:"approved"},5)));
  s=act(s,a("PAY",{cardId:s.cards[0].id,amountOre:12000,scenario:"approved"},5));
  assert.equal(s.balanceOre,88000);
  assert.equal(s.coins,6);
});
test("duplicate event idempotency keys have no effect",()=>{
  let s=act(newSandbox(),a("OPEN_ACCOUNT",{},1));
  const t=a("FUND_WALLET",{amountOre:10000},2);
  s=act(s,t);
  const again=act(s,t);
  assert.equal(again,s);
  assert.equal(again.balanceOre,10000);
});
test("3DS demo requires decision and may be rejected",()=>{
  let s=act(newSandbox(),a("OPEN_ACCOUNT",{},1));
  s=act(s,a("FUND_WALLET",{amountOre:100000},2));
  s=act(s,a("ISSUE_CARD",{cardType:"virtual",design},3));
  s=act(s,a("PAY",{cardId:s.cards[0].id,amountOre:15000,scenario:"3ds"},4));
  assert.equal(s.balanceOre,100000);
  assert.ok(s.pending3ds);
  assert.throws(()=>act(s,a("ADD_COINS",{amount:10},5)));
  s=act(s,a("COMPLETE_3DS",{approved:false},5));
  assert.equal(s.pending3ds,null);
  assert.equal(s.balanceOre,100000);
  s=act(s,a("PAY",{cardId:s.cards[0].id,amountOre:15000,scenario:"3ds"},6));
  s=act(s,a("COMPLETE_3DS",{approved:true},7));
  assert.equal(s.balanceOre,85000);
});
test("explicitly declined payments do not move balances",()=>{
  let s=act(newSandbox(),a("OPEN_ACCOUNT",{},1));
  s=act(s,a("ISSUE_CARD",{cardType:"virtual",design},2));
  s=act(s,a("PAY",{cardId:s.cards[0].id,amountOre:10000,scenario:"declined"},3));
  assert.equal(s.balanceOre,0);
  assert.equal(s.coins,0);
});
test("coin transfers cannot overdraw or create value",()=>{
  let s=act(newSandbox(),a("OPEN_ACCOUNT",{},1));
  assert.throws(()=>act(s,a("SEND_COINS",{amount:5},2)));
  s=act(s,a("ADD_COINS",{amount:100},3));
  s=act(s,a("SEND_COINS",{amount:35},4));
  assert.equal(s.coins,65);
  assert.equal(s.recipientCoins,35);
  assert.equal(s.coins+s.recipientCoins,100);
  assert.throws(()=>act(s,a("SEND_COINS",{amount:100},5)));
});
test("reset removes demo account, card, coins and history",()=>{
  let s=act(newSandbox(),a("OPEN_ACCOUNT",{},1));
  s=act(s,a("ADD_COINS",{amount:500},2));
  s=act(s,{type:"RESET"});
  assert.deepEqual(s,newSandbox());
});
