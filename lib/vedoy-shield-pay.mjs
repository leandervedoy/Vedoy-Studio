/**
 * Vedoy Shield: validation-only gates for future payment workflows.
 * No payment processing, card vault, login, authorization, or coin debit here.
 * Real card details must go directly to a PCI-compliant payment provider.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STRIPE_CUSTOMER = /^cus_[a-zA-Z0-9]+$/;
const STRIPE_METHOD = /^pm_[a-zA-Z0-9]+$/;
const CARD_BRAND = /^(visa|mastercard|amex|discover|diners|jcb|unionpay|unknown)$/;

export class ShieldPaymentError extends Error {
  constructor(code) {
    super(code);
    this.name = 'ShieldPaymentError';
    this.code = code;
  }
}

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}
function exactKeys(input, keys) {
  return Object.keys(input).every((key) => keys.includes(key));
}
function validUUID(value) {
  return typeof value === 'string' && UUID.test(value);
}

/** Allowlist metadata; rejects PAN, CVC, cardholder name or other raw payment fields. */
export function shieldCardReference(input) {
  const keys = ['customerId', 'paymentMethodId', 'brand', 'last4', 'expMonth', 'expYear'];
  if (!plainObject(input) || !exactKeys(input, keys) ||
    !STRIPE_CUSTOMER.test(input.customerId ?? '') ||
    !STRIPE_METHOD.test(input.paymentMethodId ?? '') ||
    typeof input.brand !== 'string' || !CARD_BRAND.test(input.brand) ||
    typeof input.last4 !== 'string' || !/^\d{4}$/.test(input.last4) ||
    !Number.isInteger(input.expMonth) || input.expMonth < 1 || input.expMonth > 12 ||
    !Number.isInteger(input.expYear) || input.expYear < 2020 || input.expYear > 2200 ||
    Object.keys(input).length !== keys.length) {
    throw new ShieldPaymentError('invalid_card_reference');
  }
  return Object.freeze({
    customerId: input.customerId,
    paymentMethodId: input.paymentMethodId,
    brand: input.brand,
    last4: input.last4,
    expMonth: input.expMonth,
    expYear: input.expYear
  });
}

/**
 * Sender ID MUST come from verified server-side auth, not from the request body.
 * Validation is not authentication, authorization, or an atomic ledger debit.
 */
export function shieldCoinTransferIntent(verifiedSenderId, input) {
  if (!validUUID(verifiedSenderId)) throw new ShieldPaymentError('unverified_sender');
  if (!plainObject(input) || !exactKeys(input, ['recipientUserId', 'amount', 'idempotencyKey']))
    throw new ShieldPaymentError('invalid_transfer_payload');
  if (!validUUID(input.recipientUserId) ||
    input.recipientUserId.toLowerCase() === verifiedSenderId.toLowerCase())
    throw new ShieldPaymentError('invalid_recipient');
  if (!Number.isSafeInteger(input.amount) || input.amount < 1 || input.amount > 10000)
    throw new ShieldPaymentError('invalid_coin_amount');
  if (!validUUID(input.idempotencyKey)) throw new ShieldPaymentError('invalid_idempotency_key');
  return Object.freeze({
    senderUserId: verifiedSenderId.toLowerCase(),
    recipientUserId: input.recipientUserId.toLowerCase(),
    amount: input.amount,
    idempotencyKey: input.idempotencyKey.toLowerCase()
  });
}

/** Amounts and entitlements must be computed server-side, not sent by customers. */
export function shieldNokPaymentAmount(amountOre, currency = 'NOK') {
  if (currency !== 'NOK' || !Number.isSafeInteger(amountOre) || amountOre < 1 || amountOre > 100_000_000)
    throw new ShieldPaymentError('invalid_payment_amount');
  return Object.freeze({ amountOre, currency: 'NOK' });
}

/** These features must remain off until independently verified and authorized. */
export const VEDOY_PAY_SHIELD_STATUS = Object.freeze({
  customerCardVault: 'external_provider_only',
  cardSetup: 'not_enabled',
  tapToPay: 'not_enabled',
  coinTransfers: 'not_enabled',
  coinTopUps: 'not_enabled'
});
