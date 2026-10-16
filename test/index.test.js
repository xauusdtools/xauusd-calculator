import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../src/index.js';
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test('pipValue', () => {
  close(c.pipValue(1), 10); close(c.pipValue(0.1), 1); close(c.pipValue(0.01), 0.1);
  close(c.pipValue(1, { pipSize: 0.01 }), 1);
  assert.throws(() => c.pipValue(-1), RangeError);
  assert.throws(() => c.pipValue('1'), TypeError);
});
test('priceToPips', () => { close(c.priceToPips(5), 50); });
test('roundLotsDown', () => {
  assert.equal(c.roundLotsDown(0.1299), 0.12); assert.equal(c.roundLotsDown(0.1), 0.1); assert.equal(c.roundLotsDown(1.234, 0.1), 1.2);
});
test('lotSize README example', () => {
  const r = c.lotSize(5000, 1, 5);
  close(r.riskAmount, 50); close(r.lots, 0.1); close(r.ounces, 10);
  assert.equal(c.lotSize(10000, 2, 7.5, { lotStep: 0.01 }).lots, 0.26);
  assert.throws(() => c.lotSize(5000, 0, 5), RangeError);
  assert.throws(() => c.lotSize(5000, 101, 5), RangeError);
  assert.throws(() => c.lotSize(5000, 1, 0), RangeError);
});
test('positionSize', () => {
  const r = c.positionSize({ balance: 5000, riskPct: 1, entry: 2400, stop: 2395 });
  close(r.stopDistance, 5); close(r.stopPips, 50); close(r.lots, 0.1); close(r.notional, 24000);
  const s = c.positionSize({ balance: 5000, riskPct: 1, entry: 2395, stop: 2400 });
  close(s.lots, 0.1);
  assert.throws(() => c.positionSize({ balance: 5000, riskPct: 1, entry: 2400, stop: 2400 }), RangeError);
});
test('profitLoss', () => {
  close(c.profitLoss(2400, 2410, 0.1), 100);
  close(c.profitLoss(2400, 2395, 0.1), -50);
  close(c.profitLoss(2400, 2390, 0.5, 'sell'), 500);
  assert.throws(() => c.profitLoss(2400, 2410, 1, 'long'), RangeError);
});
test('riskReward', () => {
  const r = c.riskReward(2400, 2395, 2410); close(r.risk, 5); close(r.reward, 10); close(r.ratio, 2);
  close(c.riskReward(2400, 2406, 2391, 'sell').ratio, 1.5);
  assert.throws(() => c.riskReward(2400, 2405, 2410), RangeError);
  assert.throws(() => c.riskReward(2400, 2395, 2390), RangeError);
});
test('margin', () => {
  close(c.margin(0.1, 2400, 100), 240); close(c.margin(1, 2400, 20), 12000);
  assert.throws(() => c.margin(1, 2400, 0), RangeError);
});
