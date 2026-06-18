import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import BrandKit from './pages/BrandKit'
import AIGraphics from './pages/AIGraphics'
import SocialMedia from './pages/SocialMedia'
import ContentCalendar from './pages/ContentCalendar'
import EmailCampaigns from "./pages/Emailcampaigns";

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('brandkit')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
  if (!user) return <Login onLogin={() => {}} />

  const navItems = [
    { id: 'brandkit', label: '🎨 Brand Kit' },
    { id: 'aigraphics', label: '🖼️ AI Graphics' },
    { id: 'social', label: '📱 Social Media' },
    { id: 'calendar', label: '📅 Content Calendar' },
    { id: 'email', label: '📧 Email Campaigns' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#1e1b4b', color: 'white', padding: '24px 0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#a5b4fc' }}>Sineva AI</h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{user.email}</p>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setCurrentPage(item.id)}
              style={{ width: '100%', padding: '10px 12px', marginBottom: '4px', background: currentPage === item.id ? '#6366f1' : 'transparent', color: 'white', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 12px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '220px', overflowY: 'auto' }}>
        {currentPage === 'brandkit' && <BrandKit user={user} />}
        {currentPage === 'aigraphics' && <AIGraphics user={user} />}
        {currentPage === 'social' && <SocialMedia user={user} />}
        {currentPage === 'calendar' && <ContentCalendar user={user} />}
        {currentPage === 'email' && <EmailCampaigns user={user} />}
      </div>
    </div>
  )
}

export default App