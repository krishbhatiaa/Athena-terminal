import React from 'react'

export default function Sparkline({value=0, width=120, height=36, color='var(--text-secondary)'}){
  // create a small synthetic sparkline around value
  const points = 24
  const vals = Array.from({length:points}, (_,i)=> value * (1 + (Math.sin(i/3)+Math.random()*0.5)/200))
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const d = vals.map((v,i)=>{
    const x = (i/(points-1)) * width
    const y = height - ((v - min) / (max - min || 1)) * height
    return `${i===0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{display:'block'}}>
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
