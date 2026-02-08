import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Portfolio(){
  const [portfolio, setPortfolio] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const [portfolioRes, analyticsRes] = await Promise.all([
        axios.get('/portfolio', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/portfolio/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      setPortfolio(portfolioRes.data)
      setAnalytics(analyticsRes.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card" style={{textAlign: 'center', padding: '40px'}}>
        <div style={{color: 'var(--text-secondary)'}}>Loading portfolio...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{textAlign: 'center', padding: '40px'}}>
        <div style={{color: 'var(--accent-danger)'}}>{error}</div>
        <button
          onClick={fetchPortfolioData}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: 'var(--accent-success)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  const positions = portfolio?.positions || []
  const allocationData = analytics ? Object.entries(analytics.allocation || {}).map(([symbol, pct]) => ({
    name: symbol,
    value: parseFloat(pct.toFixed(2))
  })) : []

  const performanceData = analytics && positions.length > 0 ? positions.map((pos, idx) => {
    const holding = analytics.holdings?.[pos.symbol]
    if (!holding) return null
    return {
      symbol: pos.symbol,
      cost: parseFloat(holding.cost.toFixed(2)),
      value: parseFloat(holding.value.toFixed(2))
    }
  }).filter(Boolean) : []

  return (
    <div>
      {/* Summary Cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '20px'}}>
        <div className="card">
          <div style={{color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px'}}>Total Value</div>
          <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)'}}>
            ${analytics?.total_value?.toFixed(2) || '0.00'}
          </div>
          <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>
            {positions.length} positions
          </div>
        </div>

        <div className="card">
          <div style={{color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px'}}>Total Cost</div>
          <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)'}}>
            ${analytics?.total_cost?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="card">
          <div style={{color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px'}}>Gain/Loss</div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: analytics?.total_gain_loss >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>
            ${analytics?.total_gain_loss?.toFixed(2) || '0.00'}
          </div>
          <div style={{
            fontSize: '12px',
            color: analytics?.total_gain_loss_pct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
            marginTop: '4px'
          }}>
            {analytics?.total_gain_loss_pct?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '20px'}}>
        {/* Allocation Chart */}
        {allocationData.length > 0 && (
          <div className="card">
            <div className="section-title">Portfolio Allocation</div>
            <ResponsiveContainer width="100%" height={300}>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </ResponsiveContainer>
          </div>
        )}

        {/* Performance Chart */}
        {performanceData.length > 0 && (
          <div className="card">
            <div className="section-title">Cost vs Current Value</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" fill="#8B5CF6" />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Holdings Table */}
      <div className="card">
        <div className="section-title" style={{marginBottom: '16px'}}>Holdings</div>
        {positions.length === 0 ? (
          <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '20px'}}>
            No holdings yet. Add some stocks to get started!
          </div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{color:'var(--text-secondary)', fontSize:12, borderBottom: '1px solid var(--border-color)'}}>
                <th style={{textAlign:'left', padding:'12px 8px'}}>Symbol</th>
                <th style={{textAlign:'right', padding:'12px 8px'}}>Qty</th>
                <th style={{textAlign:'right', padding:'12px 8px'}}>Avg Price</th>
                <th style={{textAlign:'right', padding:'12px 8px'}}>Current Price</th>
                <th style={{textAlign:'right', padding:'12px 8px'}}>Cost Basis</th>
                <th style={{textAlign:'right', padding:'12px 8px'}}>Current Value</th>
                <th style={{textAlign:'right', padding:'12px 8px'}}>P&L</th>
                <th style={{textAlign:'right', padding:'12px 8px'}}>%</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                const holding = analytics?.holdings?.[pos.symbol]
                if (!holding) return null
                const pnl = holding.value - holding.cost
                const pnlPct = holding.gain_loss_pct
                
                return (
                  <tr key={pos.symbol} style={{borderTop:'1px solid rgba(255,255,255,0.02)'}}>
                    <td style={{padding:'12px 8px', fontFamily:'IBM Plex Mono', fontWeight: '600'}}>{pos.symbol}</td>
                    <td style={{padding:'12px 8px', textAlign:'right'}}>{pos.qty}</td>
                    <td style={{padding:'12px 8px', textAlign:'right'}}>${holding.avg_price?.toFixed(2) || '0.00'}</td>
                    <td style={{padding:'12px 8px', textAlign:'right'}}>${holding.current_price?.toFixed(2) || '0.00'}</td>
                    <td style={{padding:'12px 8px', textAlign:'right'}}>${holding.cost?.toFixed(2) || '0.00'}</td>
                    <td style={{padding:'12px 8px', textAlign:'right'}}>${holding.value?.toFixed(2) || '0.00'}</td>
                    <td style={{
                      padding:'12px 8px',
                      textAlign:'right',
                      color: pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                      fontWeight: '600'
                    }}>
                      ${pnl?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{
                      padding:'12px 8px',
                      textAlign:'right',
                      color: pnlPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                      fontWeight: '600'
                    }}>
                      {pnlPct?.toFixed(2) || '0.00'}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
