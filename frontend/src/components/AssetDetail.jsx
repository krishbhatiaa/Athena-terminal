import React, {useEffect, useState} from 'react'
import axios from 'axios'
import CandlestickChart from './CandlestickChart'

export default function AssetDetail({symbol='AAPL', onBack}){
  const [loading, setLoading] = useState(false)
  const [tickerData, setTickerData] = useState({price:0, change:0})
  const [timeframe, setTimeframe] = useState('1D')
  const [indicators, setIndicators] = useState({sma:20, ema:50, rsi:14, macd:{fast:12, slow:26, signal:9}})
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    fetchPrice()
  }, [symbol])

  async function fetchPrice(){
    try{
      setLoading(true)
      const resp = await axios.get(`/market/price/${symbol}`)
      if(resp.data && resp.data.price) setTickerData({price:resp.data.price, change:0})
    }catch(e){
      console.error('Price fetch error', e)
    }finally{
      setLoading(false)
    }
  }

  function toggleIndicator(name){
    setIndicators(prev => {
      const copy = {...prev}
      if(name === 'macd'){
        copy.macd = copy.macd ? null : {fast:12, slow:26, signal:9}
      } else {
        copy[name] = copy[name] ? null : (name === 'rsi' ? 14 : (name === 'sma' ? 20 : 50))
      }
      return copy
    })
  }

  function updateIndicatorValue(name, value){
    setIndicators(prev => {
      const copy = {...prev}
      if(name === 'macd_fast' || name === 'macd_slow' || name === 'macd_signal'){
        copy.macd = copy.macd || {fast:12, slow:26, signal:9}
        if(name === 'macd_fast') copy.macd.fast = Number(value)
        if(name === 'macd_slow') copy.macd.slow = Number(value)
        if(name === 'macd_signal') copy.macd.signal = Number(value)
      } else {
        copy[name] = value ? Number(value) : null
      }
      return copy
    })
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div>
          <div style={{fontSize:12, color:'var(--text-secondary)', fontFamily:'IBM Plex Mono'}}>{symbol}</div>
          <div style={{fontSize:28, fontWeight:800}}>
            ${tickerData.price.toFixed(2)} 
            <span style={{color: tickerData.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginLeft:12}}>
              {tickerData.change.toFixed(2)}%
            </span>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={onBack}>Back</button>
          <button className="btn">Trade</button>
        </div>
      </div>

      <div style={{display:'flex', gap:12, marginTop:12}}>
        <div style={{flex:1}}>
          <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 12px', marginBottom:10, flexWrap:'wrap', gap:8}}>
            <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
              {['1m','5m','15m','1h','1D','1W'].map(tf => (
                <button 
                  key={tf} 
                  onClick={() => setTimeframe(tf)} 
                  className="nav-btn" 
                  style={{padding:'6px 10px', borderRadius:6, background: timeframe===tf ? 'rgba(255,255,255,0.04)' : 'transparent', color: timeframe===tf ? 'var(--text-primary)' : 'var(--text-secondary)'}}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <label style={{color:'var(--text-secondary)', fontSize:12}}>Indicators</label>
              <button onClick={() => toggleIndicator('sma')} className="nav-btn" style={{padding:'6px 8px', borderRadius:6, background: indicators.sma ? 'rgba(255,255,255,0.02)' : 'transparent'}}>SMA</button>
              <button onClick={() => toggleIndicator('ema')} className="nav-btn" style={{padding:'6px 8px', borderRadius:6, background: indicators.ema ? 'rgba(255,255,255,0.02)' : 'transparent'}}>EMA</button>
              <button onClick={() => toggleIndicator('rsi')} className="nav-btn" style={{padding:'6px 8px', borderRadius:6, background: indicators.rsi ? 'rgba(255,255,255,0.02)' : 'transparent'}}>RSI</button>
              <button onClick={() => toggleIndicator('macd')} className="nav-btn" style={{padding:'6px 8px', borderRadius:6, background: indicators.macd ? 'rgba(255,255,255,0.02)' : 'transparent'}}>MACD</button>
              <button onClick={() => setShowSettings(!showSettings)} className="nav-btn" style={{padding:'6px 8px', borderRadius:6}}>Settings</button>
            </div>
          </div>

          {showSettings && (
            <div className="card" style={{padding:'10px 12px', background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.02)', marginBottom:10}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:8}}>
                {indicators.sma && (
                  <div style={{display:'flex', flexDirection:'column', gap:4}}>
                    <label style={{color:'var(--text-secondary)', fontSize:11}}>SMA Period</label>
                    <input type="number" className="input" value={indicators.sma} onChange={(e) => updateIndicatorValue('sma', e.target.value)} style={{padding:'6px 8px', fontSize:12}} />
                  </div>
                )}
                {indicators.ema && (
                  <div style={{display:'flex', flexDirection:'column', gap:4}}>
                    <label style={{color:'var(--text-secondary)', fontSize:11}}>EMA Period</label>
                    <input type="number" className="input" value={indicators.ema} onChange={(e) => updateIndicatorValue('ema', e.target.value)} style={{padding:'6px 8px', fontSize:12}} />
                  </div>
                )}
                {indicators.rsi && (
                  <div style={{display:'flex', flexDirection:'column', gap:4}}>
                    <label style={{color:'var(--text-secondary)', fontSize:11}}>RSI Period</label>
                    <input type="number" className="input" value={indicators.rsi} onChange={(e) => updateIndicatorValue('rsi', e.target.value)} style={{padding:'6px 8px', fontSize:12}} />
                  </div>
                )}
                {indicators.macd && (
                  <div style={{display:'flex', flexDirection:'column', gap:4}}>
                    <label style={{color:'var(--text-secondary)', fontSize:11}}>MACD Fast</label>
                    <input type="number" className="input" value={indicators.macd.fast} onChange={(e) => updateIndicatorValue('macd_fast', e.target.value)} style={{padding:'6px 8px', fontSize:12}} />
                  </div>
                )}
              </div>
              {indicators.macd && (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8}}>
                  <div style={{display:'flex', flexDirection:'column', gap:4}}>
                    <label style={{color:'var(--text-secondary)', fontSize:11}}>MACD Slow</label>
                    <input type="number" className="input" value={indicators.macd.slow} onChange={(e) => updateIndicatorValue('macd_slow', e.target.value)} style={{padding:'6px 8px', fontSize:12}} />
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:4}}>
                    <label style={{color:'var(--text-secondary)', fontSize:11}}>MACD Signal</label>
                    <input type="number" className="input" value={indicators.macd.signal} onChange={(e) => updateIndicatorValue('macd_signal', e.target.value)} style={{padding:'6px 8px', fontSize:12}} />
                  </div>
                </div>
              )}
            </div>
          )}

          <CandlestickChart symbol={symbol} timeframe={timeframe} indicators={indicators} />
        </div>

        <div style={{width:420}}>
          <div className="card" style={{padding:'12px'}}>
            <div style={{fontWeight:700, marginBottom:12}}>Order Entry</div>
            <div style={{marginBottom:10}}>
              <label style={{color:'var(--text-secondary)', fontSize:12, display:'block', marginBottom:6}}>Side</label>
              <select className="input" style={{width:'100%', padding:'8px', fontSize:12}}>
                <option>Buy</option>
                <option>Sell</option>
              </select>
            </div>
            <div style={{display:'flex', gap:8, marginBottom:10}}>
              <div style={{flex:1}}>
                <label style={{color:'var(--text-secondary)', fontSize:12, display:'block', marginBottom:6}}>Type</label>
                <select className="input" style={{width:'100%', padding:'8px', fontSize:12}}>
                  <option>Market</option>
                  <option>Limit</option>
                  <option>Stop</option>
                </select>
              </div>
              <div style={{width:100}}>
                <label style={{color:'var(--text-secondary)', fontSize:12, display:'block', marginBottom:6}}>Qty</label>
                <input className="input" type="number" defaultValue={1} style={{width:'100%', padding:'8px', fontSize:12}} />
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{color:'var(--text-secondary)', fontSize:12, display:'block', marginBottom:6}}>Price</label>
              <input className="input" type="number" defaultValue={tickerData.price.toFixed(2)} style={{width:'100%', padding:'8px', fontSize:12}} />
            </div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" style={{flex:1}}>Submit</button>
              <button className="btn" style={{flex:1, background:'transparent', border:'1px solid rgba(255,255,255,0.03)'}}>Cancel</button>
            </div>
          </div>

          <div className="card" style={{marginTop:12, padding:'12px'}}>
            <div style={{fontWeight:700, marginBottom:8}}>Order Book</div>
            <div style={{color:'var(--text-secondary)', fontSize:12, marginBottom:10}}>Top bids and asks (mock)</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              <div style={{background:'rgba(16,185,129,0.04)', padding:8, borderRadius:6, fontSize:12}}>Bid 100 @ 278.10</div>
              <div style={{background:'rgba(220,34,38,0.04)', padding:8, borderRadius:6, fontSize:12}}>Ask 100 @ 278.20</div>
            </div>
          </div>

          <div className="card" style={{marginTop:12, padding:'12px'}}>
            <div style={{fontWeight:700, marginBottom:8}}>Recent Trades</div>
            <div style={{color:'var(--text-secondary)', fontSize:12}}>100 @ 278.12</div>
            <div style={{color:'var(--text-secondary)', fontSize:12, marginTop:6}}>50 @ 278.10</div>
          </div>
        </div>
      </div>
    </div>
  )
}
