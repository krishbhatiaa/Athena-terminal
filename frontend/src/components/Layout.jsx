import React from 'react'

export default function Layout({ children, onNavigate, user, onLogout, onProfile }){
  return (
    <div className="app">
      <aside className="sidebar">
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div className="brand">ATHENA</div>
          <input className="search-box" placeholder="Search symbol..." />
        </div>
        <nav className="nav" style={{marginTop:14}}>
          <button className="active" onClick={()=>onNavigate('dashboard')}>Dashboard</button>
          <button onClick={()=>onNavigate('portfolio')}>Portfolio</button>
          <button onClick={()=>onNavigate('analytics')}>Analytics</button>
        </nav>

        <div style={{marginTop:'auto', paddingTop:14, borderTop:'1px solid var(--border-color)'}}>
          <div style={{
            padding:'12px',
            background:'rgba(16, 185, 129, 0.1)',
            borderRadius:'6px',
            marginBottom:'12px'
          }}>
            <div style={{
              fontSize:'11px',
              color:'var(--text-secondary)',
              textTransform:'uppercase',
              marginBottom:'4px'
            }}>User</div>
            <div style={{
              fontSize:'13px',
              fontWeight:'600',
              color:'var(--text-primary)'
            }}>{user?.full_name || user?.username}</div>
            <div style={{
              fontSize:'11px',
              color:'var(--text-secondary)',
              marginTop:'4px'
            }}>{user?.email}</div>
          </div>
          <button
            onClick={onProfile}
            style={{
              width:'100%',
              padding:'8px 12px',
              background:'var(--accent-success)',
              color:'white',
              border:'none',
              borderRadius:'6px',
              fontSize:'12px',
              fontWeight:'600',
              cursor:'pointer',
              marginBottom:'8px'
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={onLogout}
            style={{
              width:'100%',
              padding:'8px 12px',
              background:'transparent',
              color:'var(--accent-danger)',
              border:'1px solid var(--accent-danger)',
              borderRadius:'6px',
              fontSize:'12px',
              fontWeight:'600',
              cursor:'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="header-bar">
          <div className="header-left">
            <div style={{fontSize:18, fontWeight:700}}>Market Overview</div>
            <div style={{color:'var(--text-secondary)', fontSize:13}}>Real-time | Low-latency</div>
          </div>
          <div className="header-right">
            <div style={{color:'var(--text-secondary)'}}>Connected</div>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
