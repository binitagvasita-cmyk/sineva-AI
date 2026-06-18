import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function BrandKit({ user }) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    business_name: '',
    industry: '',
    website: '',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    font_heading: 'Inter',
    font_body: 'Inter',
    tone_of_voice: '',
    target_audience: '',
    key_messages: ''
  })

  useEffect(() => {
    loadBrandKit()
  }, [])

  const loadBrandKit = async () => {
    const { data } = await supabase
      .from('brand_kit')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) setForm(data)
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: existing } = await supabase
      .from('brand_kit')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase.from('brand_kit').update({ ...form, updated_at: new Date() }).eq('user_id', user.id)
    } else {
      await supabase.from('brand_kit').insert({ ...form, user_id: user.id })
    }
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const industries = ['Technology', 'Healthcare', 'Education', 'Finance', 'Retail', 'Food & Beverage', 'Real Estate', 'Marketing', 'Fashion', 'Other']
  const fonts = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Playfair Display', 'Lato', 'Open Sans']
  const tones = ['Professional', 'Friendly', 'Playful', 'Authoritative', 'Inspirational', 'Casual', 'Luxury']

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', marginTop: '6px' }
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#374151' }
  const sectionStyle = { background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' }}>Brand Kit</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>Define your brand identity — save it once, use it everywhere.</p>

      {/* Business Info */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>Business Information</h2>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Business Name</label>
          <input style={inputStyle} placeholder="e.g. Sineva AI" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Industry</label>
          <select style={inputStyle} value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
            <option value="">Select industry</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Website</label>
          <input style={inputStyle} placeholder="https://yourwebsite.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
        </div>
      </div>

      {/* Brand Colors */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>Brand Colors</h2>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Primary Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <input type="color" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} style={{ width: '48px', height: '48px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{form.primary_color}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Secondary Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <input type="color" value={form.secondary_color} onChange={e => setForm({ ...form, secondary_color: e.target.value })} style={{ width: '48px', height: '48px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{form.secondary_color}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>Typography</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Heading Font</label>
            <select style={inputStyle} value={form.font_heading} onChange={e => setForm({ ...form, font_heading: e.target.value })}>
              {fonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Body Font</label>
            <select style={inputStyle} value={form.font_body} onChange={e => setForm({ ...form, font_body: e.target.value })}>
              {fonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Voice & Audience */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>Voice & Audience</h2>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Tone of Voice</label>
          <select style={inputStyle} value={form.tone_of_voice} onChange={e => setForm({ ...form, tone_of_voice: e.target.value })}>
            <option value="">Select tone</option>
            {tones.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Target Audience</label>
          <input style={inputStyle} placeholder="e.g. Small business owners aged 25-45" value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Key Messages</label>
          <textarea style={{ ...inputStyle, height: '100px', resize: 'vertical' }} placeholder="What are the main messages you want to communicate?" value={form.key_messages} onChange={e => setForm({ ...form, key_messages: e.target.value })} />
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
        {loading ? 'Saving...' : saved ? '✅ Saved!' : 'Save Brand Kit'}
      </button>
    </div>
  )
}