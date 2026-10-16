#!/usr/bin/env node
import { pipValue, lotSize, positionSize, profitLoss, riskReward, margin } from '../src/index.js';

const HELP = `xauusd-calc <command> [args]

  pip <lots>                              USD per pip ($0.10 pip)
  lots <balance> <riskPct> <stopDistance> lot size from risk
  position <balance> <riskPct> <entry> <stop>
  pnl <entry> <exit> <lots> [buy|sell]
  rr <entry> <stop> <target> [buy|sell]
  margin <lots> <price> <leverage>

Hypothetical maths for education only. Not financial advice.`;

const [cmd, ...a] = process.argv.slice(2);
const n = (i) => Number(a[i]);
const out = (v) => console.log(typeof v === 'number' ? Number(v.toFixed(4)) : JSON.stringify(v, null, 2));
try {
  switch (cmd) {
    case 'pip': out(pipValue(n(0))); break;
    case 'lots': out(lotSize(n(0), n(1), n(2), { lotStep: 0.01 })); break;
    case 'position': out(positionSize({ balance: n(0), riskPct: n(1), entry: n(2), stop: n(3), lotStep: 0.01 })); break;
    case 'pnl': out(profitLoss(n(0), n(1), n(2), a[3] || 'buy')); break;
    case 'rr': out(riskReward(n(0), n(1), n(2), a[3] || 'buy')); break;
    case 'margin': out(margin(n(0), n(1), n(2))); break;
    default: console.log(HELP); process.exit(cmd && !['-h', '--help', 'help'].includes(cmd) ? 1 : 0);
  }
} catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
