# xauusd-calculator

A tiny, dependency-free JavaScript library and CLI for the arithmetic gold (XAUUSD) traders do over and over: **pip value, lot size from risk, position size, profit/loss, risk:reward and margin**.

- Zero dependencies, plain ES module
- Runs in Node.js (>= 18) and modern browsers
- Input validation and JSDoc on every function
- Small CLI (`xauusd-calc`) and a static `index.html` demo
- Unit tests with the built-in `node:test` runner
- MIT licence

## Conventions

| Term | Default | Notes |
|---|---|---|
| Contract size | 1 standard lot = **100 troy oz** | Most CFD brokers. Some differ, so check your broker's contract spec. |
| Pip | **$0.10** price move | 1 pip on 1 lot = 100 × 0.10 = **$10** |
| Point | $0.01 | Some brokers call this a "pip". Pass `pipSize: 0.01` to match. |
| Mini / micro lot | 0.1 / 0.01 lots | = 10 oz / 1 oz |

All functions accept an optional contract size (`ozPerLot`) so you can match your broker.

## Formulas

```
pip value      = lots × ozPerLot × pipSize
lot size       = (balance × risk% / 100) / (stopDistance × ozPerLot)
profit/loss    = (exit − entry) × lots × ozPerLot          (buy; reversed for sell)
risk:reward    = |target − entry| / |entry − stop|
margin         = lots × ozPerLot × price / leverage
```

`stopDistance` is in price units (USD), e.g. a stop $5.00 away = 50 pips.

## Worked examples (hypothetical)

These numbers are illustrations only, not trade ideas or results.

**Lot size from risk.** Balance $5,000, risk 1% ($50), buy at 2,400.00, stop at 2,395.00 (distance $5.00 = 50 pips).

- Lot size = 50 / (5 × 100) = **0.10 lots** (10 oz)
- Pip value at 0.10 lots = 0.10 × 100 × 0.10 = **$1 per pip**; 50 pips × $1 = $50, matching the planned risk.

**Risk:reward.** Same trade with a target at 2,410.00: reward $10.00, risk $5.00 → **1 : 2**.

**Profit/loss.** If price reached the 2,410.00 target: (2,410 − 2,400) × 0.10 × 100 = **+$100**. If the stop is hit: **−$50**.

**Margin.** 0.10 lots at 2,400 with 1:100 leverage = 10 × 2,400 / 100 = **$240**. At 1:20 the same position needs $1,200.

**Rounding.** Brokers trade in volume steps (usually 0.01 lots). Always round *down* so you don't exceed your risk: $10,000 × 2% with a $7.50 stop gives 0.2667 lots → **0.26 lots**.

## Installation

Not yet published to npm. Clone the repo:

```bash
git clone https://github.com/xauusdtools/xauusd-calculator.git
cd xauusd-calculator
npm test
```

## Usage

### Node / bundlers

```js
import { pipValue, lotSize, positionSize, profitLoss, riskReward, margin } from './src/index.js';

pipValue(0.1);                          // 1     (USD per pip)
pipValue(1, { pipSize: 0.01 });         // 1     (broker uses $0.01 "pips")
lotSize(5000, 1, 5, { lotStep: 0.01 }); // { riskAmount: 50, lots: 0.1, ounces: 10 }
positionSize({ balance: 5000, riskPct: 1, entry: 2400, stop: 2395 });
// { riskAmount: 50, lots: 0.1, ounces: 10, stopDistance: 5, stopPips: 50, notional: 24000 }
profitLoss(2400, 2410, 0.1, 'buy');     // 100
riskReward(2400, 2395, 2410, 'buy');    // { risk: 5, reward: 10, ratio: 2 }
margin(0.1, 2400, 100);                 // 240
```

Invalid input (non-numbers, negative lots, zero leverage, a stop on the wrong side of entry, etc.) throws a `TypeError` or `RangeError` with a clear message.

### Browser

```html
<script type="module">
  import { positionSize } from './src/index.js';
  console.log(positionSize({ balance: 5000, riskPct: 1, entry: 2400, stop: 2395 }));
</script>
```

The included `index.html` is a small demo form. ES modules don't load over `file://`, so serve the folder locally, e.g. `npx serve .` or `python3 -m http.server`, then open `http://localhost:8000`.

For an interactive version, see the [XAUUSD pip calculator](https://goldsignalsdaily.com/tools/xauusd-pip-calculator).

### CLI

```bash
node bin/xauusd-calc.js pip 0.1                       # 1
node bin/xauusd-calc.js lots 5000 1 5                 # lot size from risk
node bin/xauusd-calc.js position 5000 1 2400 2395     # from entry/stop prices
node bin/xauusd-calc.js pnl 2400 2410 0.1 buy         # 100
node bin/xauusd-calc.js rr 2400 2395 2410 buy         # ratio 2
node bin/xauusd-calc.js margin 0.1 2400 100           # 240
```

After `npm link` (or once published) the same commands work as `xauusd-calc ...` / `npx xauusd-calc ...`.

## API

| Function | Returns |
|---|---|
| `pipValue(lots, { pipSize, ozPerLot })` | USD per pip |
| `priceToPips(distance, pipSize)` | pips |
| `roundLotsDown(lots, step = 0.01)` | lots rounded down to step |
| `lotSize(balance, riskPct, stopDistance, { ozPerLot, lotStep })` | `{ riskAmount, lots, ounces }` |
| `positionSize({ balance, riskPct, entry, stop, ozPerLot, pipSize, lotStep })` | `{ riskAmount, stopDistance, stopPips, lots, ounces, notional }` |
| `profitLoss(entry, exit, lots, side = 'buy', ozPerLot)` | USD (negative = loss) |
| `riskReward(entry, stop, target, side = 'buy')` | `{ risk, reward, ratio }` |
| `margin(lots, price, leverage, ozPerLot)` | USD |

## Limitations

- Assumes a USD-denominated account. For other account currencies, convert the USD results at your broker's rate.
- Ignores spread, commission, swap/overnight financing and slippage, all of which change real outcomes.
- Margin rules (tiered margin, regulatory leverage caps) vary by broker and jurisdiction.

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Ports (Python, Pine Script) and broker-convention options are especially welcome.

## Risk disclaimer

This project is for **education only and is not financial advice**. Trading gold CFDs, futures or spot on margin carries a high risk of loss and is not suitable for everyone. All numbers here are hypothetical examples, not trade recommendations or results. Contract sizes, pip conventions and margin rules vary by broker, so check your broker's contract specification before trading. The software is provided "as is", without warranty (see [LICENSE](LICENSE)).

## Licence

[MIT](LICENSE) © xauusdtools
