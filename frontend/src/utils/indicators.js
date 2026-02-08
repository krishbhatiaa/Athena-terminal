// Lightweight indicator implementations used by the frontend charts
export function sma(values, period) {
  const out = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { out.push(null); continue }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += values[j]
    out.push(sum / period)
  }
  return out
}

export function ema(values, period) {
  const out = []
  const k = 2 / (period + 1)
  let prev = null
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (i === 0) {
      prev = v
      out.push(v)
      continue
    }
    const emaV = (v - prev) * k + prev
    out.push(emaV)
    prev = emaV
  }
  // pad front with nulls to align
  for (let i = 0; i < period - 1; i++) out[i] = null
  return out
}

export function rsi(values, period=14) {
  const out = []
  let gains = 0
  let losses = 0
  for (let i = 0; i < values.length; i++) {
    if (i === 0) { out.push(null); continue }
    const change = values[i] - values[i-1]
    gains = (gains * (period - 1) + Math.max(0, change)) / period
    losses = (losses * (period - 1) + Math.max(0, -change)) / period
    const rs = losses === 0 ? 100 : gains / losses
    const rsiV = 100 - (100 / (1 + rs))
    out.push(rsiV)
  }
  // pad start
  for (let i = 0; i < 1; i++) out[i] = null
  return out
}

export function macd(values, fast=12, slow=26, signal=9) {
  const fastE = ema(values, fast)
  const slowE = ema(values, slow)
  const macdLine = values.map((v,i)=>{
    const f = fastE[i]
    const s = slowE[i]
    return (f == null || s == null) ? null : f - s
  })
  const signalLine = ema(macdLine.map(v=>v==null?0:v), signal)
  const hist = macdLine.map((v,i)=> (v==null || signalLine[i]==null) ? null : v - signalLine[i])
  return {macd: macdLine, signal: signalLine, hist}
}

export default { sma, ema, rsi, macd }
