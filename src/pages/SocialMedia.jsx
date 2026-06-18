import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function SocialMedia({ user }) {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [scheduleType, setScheduleType] = useState('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const platforms = [
    { id: 'instagram', label: 'Instagram', color: '#e1306c', icon: '📸' },
    { id: 'facebook', label: 'Facebook', color: '#1877f2', icon: '👤' },
    { id: 'twitter', label: 'Twitter/X', color: '#1da1f2', icon: '🐦' },
    { id: 'linkedin', label: 'LinkedIn', color: '#0077b5', icon: '💼' },
  ]

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    const { data } = await supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handlePost = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) return
    if (scheduleType === 'schedule' && !scheduledAt) {
      alert('Please select a date and time to schedule the post')
      return
    }
    setLoading(true)

    await supabase.from('social_posts').insert({
      user_id: user.id,
      content,
      platforms: selectedPlatforms,
      status: scheduleType === 'now' ? 'posted' : 'scheduled',
      scheduled_at: scheduleType === 'schedule' ? scheduledAt : null
    })

    setContent('')
    setSelectedPlatforms([])
    setScheduleType('now')
    setScheduledAt('')
    await loadPosts()
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDelete = async (id) => {
    await supabase.from('social_posts').delete().eq('id', id)
    await loadPosts()
  }

  const charCount = content.length
  const maxChars = 280

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' }}>Social Media</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>Create and schedule posts across all your platforms.</p>

      {/* Composer */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>✍️ Post Composer</h2>

        <textarea
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', height: '120px', resize: 'vertical', boxSizing: 'border-box' }}
          placeholder="What's on your mind? Write your post here..."
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={500}
        />
        <div style={{ textAlign: 'right', fontSize: '12px', color: charCount > maxChars ? 'red' : '#6b7280', marginBottom: '16px' }}>
          {charCount}/500
        </div>

        {/* Platform Selection */}
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Select Platforms</label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {platforms.map(p => (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: `2px solid ${p.color}`,
                background: selectedPlatforms.includes(p.id) ? p.color : 'white',
                color: selectedPlatforms.includes(p.id) ? 'white' : p.color,
                cursor: 'pointer', fontSize: '13px', fontWeight: '600'
              }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        {/* Schedule */}
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>When to Post?</label>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', marginBottom: '16px' }}>
          <button onClick={() => setScheduleType('now')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #6366f1', background: scheduleType === 'now' ? '#6366f1' : 'white', color: scheduleType === 'now' ? 'white' : '#6366f1', cursor: 'pointer', fontWeight: '600' }}>
            🚀 Post Now
          </button>
          <button onClick={() => setScheduleType('schedule')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #6366f1', background: scheduleType === 'schedule' ? '#6366f1' : 'white', color: scheduleType === 'schedule' ? 'white' : '#6366f1', cursor: 'pointer', fontWeight: '600' }}>
            📅 Schedule
          </button>
        </div>

        {scheduleType === 'schedule' && (
          <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '16px' }} />
        )}

        <button onClick={handlePost} disabled={loading || !content.trim() || selectedPlatforms.length === 0 || (scheduleType === 'schedule' && !scheduledAt)}
          style={{ width: '100%', padding: '14px', background: loading ? '#a5b4fc' : '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          {loading ? 'Posting...' : saved ? '✅ Posted!' : scheduleType === 'now' ? '🚀 Post Now' : '📅 Schedule Post'}
        </button>
      </div>

      {/* Posts Queue */}
      {posts.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          Abhi tak koi post nahi banaya hai. Upar se apna pehla post create kariye! 🚀
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>📋 Post Queue</h2>
          {posts.map(post => (
            <div key={post.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#374151', flex: 1 }}>{post.content}</p>
                <button onClick={() => handleDelete(post.id)}
                  style={{ marginLeft: '12px', padding: '4px 10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  🗑️ Delete
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {post.platforms?.map(p => {
                  const platform = platforms.find(pl => pl.id === p)
                  return platform ? (
                    <span key={p} style={{ padding: '3px 10px', borderRadius: '12px', background: platform.color, color: 'white', fontSize: '11px', fontWeight: '600' }}>
                      {platform.icon} {platform.label}
                    </span>
                  ) : null
                })}
                <span style={{ padding: '3px 10px', borderRadius: '12px', background: post.status === 'posted' ? '#d1fae5' : '#fef3c7', color: post.status === 'posted' ? '#065f46' : '#92400e', fontSize: '11px', fontWeight: '600' }}>
                  {post.status === 'posted' ? '✅ Posted' : '⏰ Scheduled'}
                </span>
              </div>
              {post.scheduled_at && (
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  📅 {new Date(post.scheduled_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}