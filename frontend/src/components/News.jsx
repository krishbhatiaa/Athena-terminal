import React from 'react'

export default function News(){
  const items = [
    {title:'Central Bank holds rates', tag:'macro', alert:false},
    {title:'Earnings beat at ACME Corp', tag:'earnings', alert:true},
    {title:'Commodity prices rise on supply concerns', tag:'commodities', alert:false}
  ]

  return (
    <div>
      <div className="section-title">News & Insights</div>
      <div style={{display:'grid', gap:8}}>
        {items.map((it,i)=> (
          <div key={i} className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontWeight:700}}>{it.title}</div>
              <div style={{color:'var(--text-secondary)', fontSize:12}}>{it.tag}</div>
            </div>
            {it.alert && <div style={{background:'var(--accent-amber)', color:'#111', padding:'6px 8px', borderRadius:6, fontWeight:700}}>Breaking</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
