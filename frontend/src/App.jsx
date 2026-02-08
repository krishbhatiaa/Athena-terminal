import React, { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import AssetDetail from './components/AssetDetail'
import Portfolio from './components/Portfolio'
import Login from './components/Login'
import Register from './components/Register'
import UserProfile from './components/UserProfile'

export default function App(){
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [user, setUser] = React.useState(null)
  const [showAuthPage, setShowAuthPage] = React.useState('login') // 'login' or 'register'
  const [showProfileModal, setShowProfileModal] = React.useState(false)
  
  // App navigation state
  const [route, setRoute] = React.useState('dashboard')
  const [selectedSymbol, setSelectedSymbol] = React.useState('AAPL')

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      setIsAuthenticated(true)
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        localStorage.clear()
      }
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setRoute('dashboard')
  }

  const handleRegisterSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setRoute('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setRoute('dashboard')
    setShowAuthPage('login')
  }

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser)
    setShowProfileModal(false)
  }

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return (
      <>
        {showAuthPage === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setShowAuthPage('register')}
          />
        ) : (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setShowAuthPage('login')}
          />
        )}
      </>
    )
  }

  // Authenticated user interface
  return (
    <Layout
      onNavigate={(r, sym)=>{
        setRoute(r)
        if(sym) setSelectedSymbol(sym)
      }}
      user={user}
      onLogout={handleLogout}
      onProfile={() => setShowProfileModal(true)}
    >
      {route === 'dashboard' && <Dashboard onOpen={(sym)=>{ setSelectedSymbol(sym); setRoute('asset')}} />}
      {route === 'asset' && <AssetDetail symbol={selectedSymbol} onBack={()=>setRoute('dashboard')} />}
      {route === 'portfolio' && <Portfolio />}

      {showProfileModal && (
        <UserProfile
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </Layout>
  )
}
