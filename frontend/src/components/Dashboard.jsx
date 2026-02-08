import React, {useEffect, useState, useRef} from 'react'
import MarketCard from './MarketCard'
import axios from 'axios'

const WATCHLIST = ['AAPL','MSFT','TSLA']

export default function Dashboard({onOpen}){
  const [prices, setPrices] = useState({})
  const esRef = useRef(null)

  useEffect(()=>{
    let mounted = true
    // fetch initial prices
    Promise.all(WATCHLIST.map(s => axios.get(`/market/price/${s}`))).then(res =>{
      if(!mounted) return
      const p = {}
      res.forEach(r=>{ if(r.data && r.data.symbol) p[r.data.symbol] = r.data.price })
      setPrices(p)
    }).catch(()=>{})

    // open SSE connection
    const url = `/market/stream?symbols=${WATCHLIST.join(',')}`
    const es = new EventSource(url)
    es.onmessage = (ev)=>{
      try{
        const data = JSON.parse(ev.data)
        setPrices(prev => ({...prev, ...data}))
      }catch(e){}
    }
    esRef.current = es

    return ()=>{
      mounted = false
      if(esRef.current) esRef.current.close()
    }
  }, [])

  return (
    <div>
      <div className="grid">
        {WATCHLIST.map((s)=> (
          <MarketCard key={s} symbol={s} price={prices[s]||0} change={0} onOpen={onOpen} />
        ))}
      </div>

      <div style={{marginTop:14}} className="card">
        <div className="section-title">Market Movers</div>
        <div style={{display:'flex', gap:12}}>
          {WATCHLIST.map(s=> <MarketCard key={s+'_mm'} symbol={s} price={prices[s]||0} change={0} onOpen={onOpen} />)}
        </div>
      </div>
    </div>
  )
}
