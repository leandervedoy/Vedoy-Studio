/**
 * Vedoy Shield / Pay: fail-closed card DESIGN validation.
 * No PAN, CVC, PIN, account number or transfer payload is accepted.
 * These are presentation preferences, NOT a payment-card issuance request.
 */
export const PAY_COLORS = Object.freeze(["obsidian","fjord","pine","sand","plum","rose"]);
export const PAY_PATTERNS = Object.freeze(["solid","waves","grid","diagonal","orbit"]);
const isPlain = (x) => x !== null && typeof x === "object" && !Array.isArray(x) &&
  Object.getPrototypeOf(x) === Object.prototype;

export function validatePayDesign(input) {
  if (!isPlain(input) || Object.keys(input).length !== 3 ||
      !Object.keys(input).every((key) => ["color","pattern","label"].includes(key))) {
    throw new Error("Ugyldig kortdesign.");
  }
  const {color,pattern,label} = input;
  if (typeof color !== "string" || !PAY_COLORS.includes(color) ||
      typeof pattern !== "string" || !PAY_PATTERNS.includes(pattern) ||
      typeof label !== "string") throw new Error("Ugyldig kortdesign.");
  const clean = label.trim();
  if (clean.length < 1 || clean.length > 24 ||
      /[\u0000-\u001f\u007f<>]/.test(clean) || /(?:\d[ -]?){12,19}/.test(clean)) {
    throw new Error("Bruk et kort navn, uten kort- eller kontonummer.");
  }
  return Object.freeze({color,pattern,label:clean});
}

export function payIdentityIsVerified(userId) {
  return typeof userId === "string" &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(userId);
}

export function allowLinkedPartner(status, verifiedAt) {
  return status === "verified" && typeof verifiedAt === "string" &&
    Number.isFinite(Date.parse(verifiedAt)) && Date.parse(verifiedAt) <= Date.now();
}

/** Intentionally no public functions that issue cards, hold money or transfer coins. */
export const VEDOY_PAY_ACTIONS = Object.freeze({
  issueCard: false, openBankAccount: false, transferCoins: false, chargeCustomer: false
});
