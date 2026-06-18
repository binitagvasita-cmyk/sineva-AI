import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const platforms = [
  { id: 'instagram', label: 'Instagram', color: '#e1306c', icon: '📸' },
  { id: 'facebook', label: 'Facebook', color: '#1877f2', icon: '👤' },
  { id: 'twitter', label: 'Twitter/X', color: '#1da1f2', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0077b5', icon: '💼' },
]

const bestTimes = {
  instagram: '11 AM – 1 PM & 7 PM – 9 PM',
  facebook: '1 PM – 4 PM',
  twitter: '9 AM – 10 AM & 6 PM – 7 PM',
  linkedin: '8 AM – 10 AM (Tue–Thu)',
}

export default function ContentCalendar({ user }) {
  const [posts, setPosts] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [saving, setSaving] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [brandKit, setBrandKit] = useState(null)

  useEffect(() => {
    loadPosts()
    loadBrandKit()
  }, [])

  const loadPosts = async () => {
    const { data } = await supabase.from('social_posts').select('*').eq('user_id', user.id)
    if (data) setPosts(data)
  }

  const loadBrandKit = async () => {
    const { data } = await supabase.from('brand_kit').select('*').eq('user_id', user.id).single()
    if (data) setBrandKit(data)
  }

  const getDateKey = (post) => {
    const d = post.scheduled_at ? new Date(post.scheduled_at) : new Date(post.created_at)
    return d.toDateString()
  }

  const postsByDate = {}
  posts.forEach(p => {
    const key = getDateKey(p)
    if (!postsByDate[key]) postsByDate[key] = []
    postsByDate[key].push(p)
  })

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const calendarCells = []
  for (let i = 0; i < startWeekday; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(new Date(year, month, d))

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
  const changeMonth = (delta) => setCurrentMonth(new Date(year, month + delta, 1))

  const openDateForm = (date) => {
    setSelectedDate(date)
    setContent('')
    setSelectedPlatforms([])
  }

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const handleAddPost = async () => {
    if (!content.trim() || selectedPlatforms.length === 0 || !selectedDate) return
    setSaving(true)
    const scheduledDateTime = new Date(selectedDate)
    scheduledDateTime.setHours(10, 0, 0)

    await supabase.from('social_posts').insert({
      user_id: user.id,
      content,
      platforms: selectedPlatforms,
      status: 'scheduled',
      scheduled_at: scheduledDateTime.toISOString()
    })

    await loadPosts()
    setSaving(false)
    setSelectedDate(null)
  }

  const generateSuggestions = () => {
    const business = brandKit?.business_name || 'your business'
    const audience = brandKit?.target_audience || 'your customers'
    const industry = brandKit?.industry || 'your industry'

    const templates = [
      `🎉 Big news from ${business}! Here's what we've been working on this week...`,
      `Did you know? ${business} helps ${audience} get better results — here's how we do it.`,
      `Behind the scenes at ${business}: a quick look at how we work every day. 👀`,
      `Question for everyone: what's your biggest challenge with ${industry}? Tell us in the comments! 💬`,
      `Customer spotlight: see how ${business} made a real difference for someone just like you. ⭐`,
    ]
    setSuggestions(templates)
  }

  const useSuggestion = (text) => setContent(text)
  const todayStr = new Date().toDateString()

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' }}>Content Calendar</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>Plan your posts visually, get quick content ideas.</p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2', minWidth: '320px', background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={() => changeMonth(-1)} style={{ padding: '6px 14px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>‹ Prev</button>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#374151', margin: 0 }}>{monthLabel}</h2>
            <button onClick={() => changeMonth(1)} style={{ padding: '6px 14px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>Next ›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#9ca3af' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {calendarCells.map((date, i) => {
              if (!date) return <div key={i} />
              const key = date.toDateString()
              const dayPosts = postsByDate[key] || []
              const isToday = key === todayStr
              return (
                <div key={i} onClick={() => openDateForm(date)}
                  style={{
                    minHeight: '70px', padding: '6px', borderRadius: '8px', cursor: 'pointer',
                    border: isToday ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    background: selectedDate?.toDateString() === key ? '#eef2ff' : 'white'
                  }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{date.getDate()}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                    {dayPosts.slice(0, 4).map(p => (p.platforms || []).slice(0, 1).map(plat => {
                      const platform = platforms.find(pl => pl.id === plat)
                      return platform ? <span key={p.id} style={{ width: '8px', height: '8px', borderRadius: '50%', background: platform.color, display: 'inline-block' }} /> : null
                    }))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedDate && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>
                Add post — {selectedDate.toLocaleDateString()}
              </h3>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Write your post..."
                style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '10px' }} />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {platforms.map(p => (
                  <button key={p.id} onClick={() => togglePlatform(p.id)}
                    style={{ padding: '5px 10px', borderRadius: '14px', border: `1.5px solid ${p.color}`, fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                      background: selectedPlatforms.includes(p.id) ? p.color : 'white', color: selectedPlatforms.includes(p.id) ? 'white' : p.color }}>
                    {p.icon}
                  </button>
                ))}
              </div>
              <button onClick={handleAddPost} disabled={saving || !content.trim() || selectedPlatforms.length === 0}
                style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                {saving ? 'Saving...' : '📅 Add to Calendar'}
              </button>
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>✨ Content Ideas</h3>
            <button onClick={generateSuggestions}
              style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
              Get Content Ideas
            </button>
            {suggestions.map((s, i) => (
              <div key={i} onClick={() => useSuggestion(s)}
                style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#374151', marginBottom: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                {s}
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>⏰ Best Times to Post</h3>
            {platforms.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#374151' }}>{p.icon} {p.label}</span>
                <span style={{ color: '#6b7280' }}>{bestTimes[p.id]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}