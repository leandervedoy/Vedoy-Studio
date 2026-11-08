/**
 * Vedoy Pay / isolated browser-only sandbox engine.
 *
 * SIMULATED values only. No banking/card/Wallester/Aera/Stripe network calls.
 * No issuance of financial instruments, PAN, CVC, IBAN, or spendable balances.
 * Import only in the sandbox preview. Never integrate with production ledger.
 */
import { validatePayDesign } from "./validation.mjs";

const KIND = "vedoy-pay-local-sandbox";
const VERSION = 1;
const LIMIT_ORE = 10_000_000;
const MAX_CARDS = 4;
const MAX_EVENTS = 40;
const MAX_KEYS = 100;
const KEY = /^sim_[a-z0-9_-]{12,90}$/i;

const isObject = (x) => x !== null && typeof x === "object" &&
  !Array.isArray(x) && Object.getPrototypeOf(x) === Object.prototype;
const coinInteger = (n) => Number.isSafeInteger(n) && n > 0 && n <= 10_000;
const amountInteger = (n) => Number.isSafeInteger(n) && n >= 100 && n <= 2_500_000;

export class SandboxError extends Error {
  constructor(message) {
    super(message);
    this.name = "SandboxError";
  }
}

export function newSandbox() {
  return {
    kind: KIND, version: VERSION, accountOpened: false,
    balanceOre: 0, coins: 0, recipientCoins: 0,
    cards: [], events: [], usedKeys: [], pending3ds: null, revision: 0
  };
}

export function isSandboxState(s) {
  return isObject(s) && s.kind === KIND && s.version === VERSION &&
    typeof s.accountOpened === "boolean" &&
    Number.isSafeInteger(s.balanceOre) && s.balanceOre >= 0 && s.balanceOre <= LIMIT_ORE &&
    Number.isSafeInteger(s.coins) && s.coins >= 0 && s.coins <= 1_000_000 &&
    Number.isSafeInteger(s.recipientCoins) && s.recipientCoins >= 0 && s.recipientCoins <= 1_000_000 &&
    Number.isSafeInteger(s.revision) && s.revision >= 0 &&
    Array.isArray(s.cards) && s.cards.length <= MAX_CARDS &&
    Array.isArray(s.events) && s.events.length <= MAX_EVENTS &&
    Array.isArray(s.usedKeys) && s.usedKeys.length <= MAX_KEYS &&
    (s.pending3ds === null || (isObject(s.pending3ds) &&
      amountInteger(s.pending3ds.amountOre) && typeof s.pending3ds.cardId === "string"));
}

const PARAMS = Object.freeze({
  OPEN_ACCOUNT: ["type","idempotencyKey"],
  FUND_WALLET: ["type","idempotencyKey","amountOre"],
  ADD_COINS: ["type","idempotencyKey","amount"],
  ISSUE_CARD: ["type","idempotencyKey","cardType","design"],
  PAY: ["type","idempotencyKey","cardId","amountOre","scenario"],
  COMPLETE_3DS: ["type","idempotencyKey","approved"],
  SEND_COINS: ["type","idempotencyKey","amount"],
  RESET: ["type"]
});

function checkAction(a) {
  if (!isObject(a) || !Object.hasOwn(PARAMS, a.type) ||
    Object.keys(a).some(k => !PARAMS[a.type].includes(k))) {
    throw new SandboxError("Ukjent eller ugyldig sandbox-handling.");
  }
  if (a.type !== "RESET" && (typeof a.idempotencyKey !== "string" || !KEY.test(a.idempotencyKey))) {
    throw new SandboxError("Ugyldig idempotensnøkkel.");
  }
}
function logged(s, a, label, details = {}) {
  return {
    ...s, revision: s.revision + 1,
    usedKeys: [...s.usedKeys, a.idempotencyKey].slice(-MAX_KEYS),
    events: [{ id: "sandbox-event-"+(s.revision+1), label, ...details }, ...s.events].slice(0,MAX_EVENTS)
  };
}
function needAccount(s) {
  if (!s.accountOpened) throw new SandboxError("Opprett testkonto først.");
}
function validMoney(a) {
  if (!amountInteger(a.amountOre)) throw new SandboxError("Beløp må være 1–25 000 testkroner.");
}
function validCoins(amount) {
  if (!coinInteger(amount)) throw new SandboxError("Velg 1–10 000 test-Coins.");
}
function charge(s,amountOre) {
  if (s.balanceOre < amountOre) {
    return { ...s, status:"declined", msg:"Avvist: for lav testsaldo.", amountOre };
  }
  const earned=Math.floor(amountOre/2000);
  return {
    ...s, status:"approved", msg:"Godkjent testbetaling", amountOre,
    balanceOre:s.balanceOre-amountOre, coins:s.coins+earned,
    earned
  };
}

/**
 * Pure deterministic transition; simulation only, not a secure financial ledger.
 * Idempotency is for demo UI only; not distributed or persistent payment protection.
 */
export function applySandboxAction(state,action) {
  if (!isSandboxState(state)) throw new SandboxError("Ugyldig sandbox-status. Tilbakestill.");
  checkAction(action);
  if (action.type === "RESET") return newSandbox();
  if (state.usedKeys.includes(action.idempotencyKey)) return state;
  if (state.pending3ds && action.type !== "COMPLETE_3DS")
    throw new SandboxError("Fullfør eller avbryt test-3DS først.");
  let s = { ...state };
  switch (action.type) {
    case "OPEN_ACCOUNT":
      if (s.accountOpened) throw new SandboxError("Testkonto finnes allerede.");
      return logged({ ...s,accountOpened:true },action,"Testkonto opprettet");
    case "FUND_WALLET":
      needAccount(s); validMoney(action);
      if (s.balanceOre+action.amountOre > LIMIT_ORE)
        throw new SandboxError("Testkontoen kan ikke overstige 100 000 testkroner.");
      return logged({ ...s,balanceOre:s.balanceOre+action.amountOre },action,
        "Testpenger lagt til",{ amountOre:action.amountOre,status:"simulated"});
    case "ADD_COINS":
      needAccount(s); validCoins(action.amount);
      if (s.coins+action.amount > 1_000_000)
        throw new SandboxError("Demo-Coin-grense er nådd.");
      return logged({ ...s, coins:s.coins+action.amount },action,
        "Demo-Coins lagt til",{coins:action.amount,status:"simulated"});
    case "ISSUE_CARD": {
      needAccount(s);
      if (!["virtual","physical"].includes(action.cardType))
        throw new SandboxError("Ugyldig testkorttype.");
      if (s.cards.length >= MAX_CARDS) throw new SandboxError("Maks fire testkort.");
      let design;
      try { design = validatePayDesign(action.design); }
      catch { throw new SandboxError("Ugyldig kortdesign."); }
      const id = "sandbox-card-"+(s.cards.length+1);
      const card = {id,type:action.cardType,status:action.cardType==="physical"?"not_shipped":"active",
        displaySuffix:String(s.cards.length+1).padStart(4,"0"),design};
      return logged({...s,cards:[...s.cards,card]},action,
        action.cardType==="virtual"?"Virtuelt testkort opprettet":"Fysisk kortordre simulert",
        {cardId:id,status:"simulated"});
    }
    case "PAY": {
      needAccount(s); validMoney(action);
      if (!s.cards.some(c=>c.id===action.cardId && c.status==="active"))
        throw new SandboxError("Velg et aktivt virtuelt testkort.");
      if (!["approved","declined","3ds"].includes(action.scenario))
        throw new SandboxError("Velg et gyldig betalingsscenario.");
      if (action.scenario==="3ds") return logged({...s,pending3ds:{amountOre:action.amountOre,cardId:action.cardId}},action,
        "Simulert 3DS kreves",{amountOre:action.amountOre,status:"challenge"});
      if (action.scenario==="declined") return logged(s,action,"Avvist testbetaling",
        {amountOre:action.amountOre,status:"declined"});
      const charged=charge(s,action.amountOre);
      const {status,msg,amountOre,earned,...next}=charged;
      return logged(next,action,msg,{amountOre,status,coins:earned||0});
    }
    case "COMPLETE_3DS": {
      needAccount(s);
      if (!s.pending3ds) throw new SandboxError("Ingen 3DS-test venter.");
      if (typeof action.approved!=="boolean") throw new SandboxError("Ugyldig bekreftelse.");
      const amountOre=s.pending3ds.amountOre;
      s.pending3ds=null;
      if (!action.approved) return logged(s,action,"3DS-test avbrutt",
        {amountOre,status:"declined"});
      const charged=charge(s,amountOre);
      const {status,msg,earned,...next}=charged;
      return logged(next,action,msg+" etter demo-3DS",{amountOre,status,coins:earned||0});
    }
    case "SEND_COINS":
      needAccount(s); validCoins(action.amount);
      if (s.coins < action.amount) throw new SandboxError("Ikke nok demo-Coins.");
      if (s.recipientCoins+action.amount>1_000_000)
        throw new SandboxError("Testmottaker har nådd grensen.");
      return logged({...s,coins:s.coins-action.amount,recipientCoins:s.recipientCoins+action.amount},
        action,"Demo-Coins sendt til Testmottaker",{coins:action.amount,status:"simulated"});
    default:
      throw new SandboxError("Ukjent sandbox-handling.");
  }
}
