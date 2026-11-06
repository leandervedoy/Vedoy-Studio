import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shieldCardReference, shieldCoinTransferIntent, shieldNokPaymentAmount,
  VEDOY_PAY_SHIELD_STATUS, ShieldPaymentError
} from '../lib/vedoy-shield-pay.mjs';

const a = '123e4567-e89b-42d3-a456-426614174000';
const b = '123e4567-e89b-42d3-a456-426614174001';
const id = '123e4567-e89b-42d3-a456-426614174002';
const ref = {customerId:'cus_123456789',paymentMethodId:'pm_123456789',brand:'visa',last4:'4242',expMonth:12,expYear:2030};

test('shield accepts Stripe reference-only metadata', () => {
  assert.deepEqual(shieldCardReference(ref), ref);
});
test('shield rejects raw PAN, CVC, and unknown card fields', () => {
  for (const bad of [{...ref, cardNumber:'4242424242424242'}, {...ref, cvc:'123'}, {...ref, number:'42'}]) {
    assert.throws(() => shieldCardReference(bad), ShieldPaymentError);
  }
});
test('shield rejects incomplete or malformed refs', () => {
  assert.throws(() => shieldCardReference({...ref, last4:'4242424242424242'}));
  assert.throws(() => shieldCardReference({...ref, expMonth:13}));
  assert.throws(() => shieldCardReference({...ref, paymentMethodId:'not-stripe'}));
  assert.throws(() => shieldCardReference({...ref, expYear:null}));
});
test('shield accepts one syntactically valid coin intent', () => {
  assert.equal(shieldCoinTransferIntent(a, {recipientUserId:b, amount:100, idempotencyKey:id}).amount,100);
});
test('shield rejects self-transfer, client sender, decimal and negative amounts', () => {
  assert.throws(() => shieldCoinTransferIntent(a, {recipientUserId:a, amount:100, idempotencyKey:id}));
  assert.throws(() => shieldCoinTransferIntent(a, {recipientUserId:b, amount:100, idempotencyKey:id, senderUserId:a}));
  assert.throws(() => shieldCoinTransferIntent(a, {recipientUserId:b, amount:0.1, idempotencyKey:id}));
  assert.throws(() => shieldCoinTransferIntent(a, {recipientUserId:b, amount:-1, idempotencyKey:id}));
});
test('NOK check and fail-closed flags', () => {
  assert.deepEqual(shieldNokPaymentAmount(19900), {amountOre:19900,currency:'NOK'});
  assert.throws(() => shieldNokPaymentAmount(100,'EUR'));
  assert.equal(VEDOY_PAY_SHIELD_STATUS.coinTransfers,'not_enabled');
  assert.equal(VEDOY_PAY_SHIELD_STATUS.cardSetup,'not_enabled');
});
