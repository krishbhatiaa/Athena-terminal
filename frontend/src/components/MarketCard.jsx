import React from 'react'
import Sparkline from './Sparkline'

export default function MarketCard({symbol, price=0, change=0, onOpen}){
  return (
    <div style={{minWidth:200, padding:12, borderRadius:8, background:'transparent'}} className="card fade-in">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontSize:12, color:'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace'}}>{symbol}</div>
          <div style={{display:'flex', alignItems:'baseline', gap:8}}>
            <div style={{fontSize:20, fontWeight:700}}>${(price||0).toFixed(2)}</div>
            <div className={`price-change ${change>=0? 'up':'down'}`} style={{fontSize:13}}>{(change>=0?'+':'')+change.toFixed(2)}%</div>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:12, color:'var(--text-secondary)'}}>24h</div>
        </div>
      </div>
      <div style={{marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{width:120, height:36, borderRadius:6}}>
          <Sparkline value={price||0} />
        </div>
        <button className="btn" style={{padding:'8px 12px'}} onClick={()=>onOpen && onOpen(symbol)}>View</button>
      </div>
    </div>
  )
}
