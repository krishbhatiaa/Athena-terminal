import React, {useEffect, useRef, useState} from 'react'
import Plotly from 'plotly.js-basic-dist'
import axios from 'axios'
import { sma, ema, rsi, macd } from '../utils/indicators'

const PERIOD_MAP = {
  '1m': '1mo',
  '5m': '1mo',
  '15m': '3mo',
  '1h': '6mo',
  '1D': '1y',
  '1W': '5y'
}

export default function CandlestickChart({symbol='AAPL', timeframe='1D', indicators={}}){
  const ref = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const esRef = useRef(null)
  const chartDataRef = useRef({dates:[],open:[],high:[],low:[],close:[],volume:[]})
  const [chartStats, setChartStats] = useState({high:0, low:0, avg:0, range:0})

  useEffect(()=>{ fetchAndDraw() }, [symbol, timeframe, indicators])

  useEffect(()=>{
    // subscribe to live price stream
    const url = `/market/stream?symbols=${symbol}`
    const es = new EventSource(url)
    es.onmessage = (ev)=>{
      try{
        const data = JSON.parse(ev.data)
        if(data[symbol] !== null && data[symbol] !== undefined){
          // append new price tick (mock OHLC candle)
          const now = new Date().toISOString()
          const price = data[symbol]
          if(chartDataRef.current){
            chartDataRef.current.dates.push(now)
            chartDataRef.current.close.push(price)
            chartDataRef.current.open.push(price)
            chartDataRef.current.high.push(price * 1.001)
            chartDataRef.current.low.push(price * 0.999)
            chartDataRef.current.volume.push(Math.random() * 1000000)
            // Keep only recent 200 candles
            if(chartDataRef.current.close.length > 200){
              chartDataRef.current.dates.shift()
              chartDataRef.current.open.shift()
              chartDataRef.current.high.shift()
              chartDataRef.current.low.shift()
              chartDataRef.current.close.shift()
              chartDataRef.current.volume.shift()
            }
            // update chart
            Plotly.restyle(ref.current, {
              x: [chartDataRef.current.dates, ...Array(7).fill(null).map(()=>chartDataRef.current.dates)],
              open: [chartDataRef.current.open],
              high: [chartDataRef.current.high],
              low: [chartDataRef.current.low],
              close: [chartDataRef.current.close]
            }, [0])
          }
        }
      }catch(e){}
    }
    esRef.current = es
    return ()=>{ if(esRef.current) esRef.current.close() }
  }, [symbol])

  async function fetchAndDraw(){
    setLoading(true)
    try{
      const period = PERIOD_MAP[timeframe] || '1y'
      const resp = await axios.get(`/market/history/${symbol}?period=${period}`)
      const data = resp.data && resp.data.data ? resp.data.data : resp.data
      // handle both lowercase and capitalized keys
      const dates = data.map(d=>d.Date || d.date)
      const open = data.map(d=>parseFloat(d.Open || d.open))
      const high = data.map(d=>parseFloat(d.High || d.high))
      const low = data.map(d=>parseFloat(d.Low || d.low))
      const close = data.map(d=>parseFloat(d.Close || d.close))
      const volume = data.map(d=>parseFloat(d.Volume || d.volume || 0))

      // store in ref for live updates
      chartDataRef.current = {dates, open, high, low, close, volume}

      // calculate stats
      const highVal = Math.max(...high)
      const lowVal = Math.min(...low)
      const avgVal = close.reduce((a, b) => a + b, 0) / close.length
      const range = highVal - lowVal
      setChartStats({high: highVal, low: lowVal, avg: avgVal, range})
      setError(null)

      const traces = [
        {
          x: dates,
          open, high, low, close,
          type: 'candlestick',
          name: symbol,
          increasing: {line:{color: '#10B981'}},
          decreasing: {line:{color: '#DC2626'}}
        }
      ]

      // overlays
      if(indicators.sma){
        traces.push({x:dates, y: sma(close, indicators.sma), mode:'lines', name:`SMA(${indicators.sma})`, line:{color:'#8892A6', width:1}})
      }
      if(indicators.ema){
        traces.push({x:dates, y: ema(close, indicators.ema), mode:'lines', name:`EMA(${indicators.ema})`, line:{color:'#00B4D8', width:1}})
      }

      // volume as separate bar trace on secondary y-axis
      traces.push({x:dates, y: volume, type:'bar', name:'Volume', marker:{color:'rgba(255,255,255,0.06)'}, yaxis:'y2'})

      // Build layout with dynamic subplots for RSI/MACD
      const layout = {
        margin:{t:20, r:10, l:50, b:40},
        yaxis:{title:'Price', domain:[0.3, 1]},
        yaxis2:{title:'Volume', domain:[0.15, 0.3], anchor:'x'},
        xaxis:{rangeslider:{visible:false}},
        showlegend:true,
        hovermode:'x unified',
        paper_bgcolor:'rgba(0,0,0,0)', 
        plot_bgcolor:'rgba(0,0,0,0)',
        font:{color: '#E5E7EB', family:'IBM Plex Mono'},
      }

      // add RSI if requested
      if(indicators.rsi){
        const rsiVals = rsi(close, indicators.rsi || 14)
        traces.push({x:dates, y:rsiVals, mode:'lines', name:`RSI(${indicators.rsi || 14})`, yaxis:'y3', line:{color: '#F59E0B', width:2}})
        layout.yaxis3 = {title:'RSI', domain:[0, 0.15], anchor:'x'}
      }

      // add MACD if requested
      if(indicators.macd){
        const m = macd(close, indicators.macd.fast || 12, indicators.macd.slow || 26, indicators.macd.signal || 9)
        traces.push({x:dates, y:m.macd, mode:'lines', name:'MACD', yaxis:indicators.rsi?'y4':'y3', line:{color:'#60A5FA', width:2}})
        traces.push({x:dates, y:m.signal, mode:'lines', name:'Signal', yaxis:indicators.rsi?'y4':'y3', line:{color:'#F59E0B', width:2}})
        traces.push({x:dates, y:m.hist, type:'bar', name:'MACD Hist', yaxis:indicators.rsi?'y4':'y3', marker:{color:'rgba(255,255,255,0.08)'}})
        const yaxisLabel = indicators.rsi ? 'y4' : 'y3'
        layout[`yaxis${indicators.rsi?'4':'3'}`] = {title:'MACD', domain:[0, 0.15], anchor:'x'}
      }

      Plotly.newPlot(ref.current, traces, layout, {responsive:true, displayModeBar:false})
    }catch(e){
      console.error('Chart draw error:', e)
      setError(`Failed to load chart: ${e.message}`)
    }finally{ setLoading(false) }
  }

  return (
    <div className="card" style={{display:'flex', flexDirection:'column', padding:12}}>
      {/* Header & Stats */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
        <div>
          <div style={{fontWeight:700, fontSize:16}}>{symbol}</div>
          <div style={{color:'var(--text-secondary)', fontSize:12, marginTop:4}}>{timeframe}</div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, textAlign:'right'}}>
          <div>
            <div style={{color:'var(--text-secondary)', fontSize:11}}>HIGH</div>
            <div style={{fontSize:14, fontWeight:600, color:'var(--accent-green)'}}>${chartStats.high.toFixed(2)}</div>
          </div>
          <div>
            <div style={{color:'var(--text-secondary)', fontSize:11}}>LOW</div>
            <div style={{fontSize:14, fontWeight:600, color:'var(--accent-red)'}}>${chartStats.low.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      {error ? (
        <div style={{padding:20, textAlign:'center', color:'var(--accent-red)', fontSize:12}}>
          {error}
        </div>
      ) : (
        <>
          <div ref={ref} style={{flex:1, minHeight:500}} />
          <div style={{textAlign:'center', color:'var(--text-secondary)', fontSize:10, marginTop:8}}>
            {loading ? 'Loading chart data…' : 'Data updated'} • Range: ${chartStats.range.toFixed(2)}
          </div>
        </>
      )}
    </div>
  )
}
