import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const industryData = {
  fitness: {
    industry: 'Healthcare', primary_color: '#f97316', secondary_color: '#1e293b',
    font_heading: 'Montserrat', font_body: 'Inter', tone_of_voice: 'Inspirational',
    audience: 'Health-conscious individuals aged 25-45 looking to transform their lifestyle',
    messages: 'Transform your body, transform your life\nNo gym required — results guaranteed\nYour journey to fitness starts today'
  },
  food: {
    industry: 'Food & Beverage', primary_color: '#ef4444', secondary_color: '#fbbf24',
    font_heading: 'Playfair Display', font_body: 'Lato', tone_of_voice: 'Friendly',
    audience: 'Food lovers aged 20-45 who enjoy quality dining experiences',
    messages: 'Fresh ingredients, unforgettable taste\nMade with love, served with passion\nEvery bite tells a story'
  },
  tech: {
    industry: 'Technology', primary_color: '#6366f1', secondary_color: '#06b6d4',
    font_heading: 'Inter', font_body: 'Roboto', tone_of_voice: 'Professional',
    audience: 'Tech-savvy professionals and businesses looking for innovative solutions',
    messages: 'Innovation that drives results\nSimplifying technology for everyone\nYour success is our mission'
  },
  education: {
    industry: 'Education', primary_color: '#8b5cf6', secondary_color: '#10b981',
    font_heading: 'Poppins', font_body: 'Open Sans', tone_of_voice: 'Friendly',
    audience: 'Students, parents and lifelong learners aged 15-45',
    messages: 'Learn smarter, grow faster\nQuality education for everyone\nUnlock your full potential'
  },
  fashion: {
    industry: 'Fashion', primary_color: '#ec4899', secondary_color: '#1f2937',
    font_heading: 'Playfair Display', font_body: 'Inter', tone_of_voice: 'Luxury',
    audience: 'Style-conscious individuals aged 20-40 who value quality and aesthetics',
    messages: 'Style that speaks for itself\nFashion forward, always on trend\nWear your confidence'
  },
  finance: {
    industry: 'Finance', primary_color: '#0f766e', secondary_color: '#1e40af',
    font_heading: 'Montserrat', font_body: 'Inter', tone_of_voice: 'Authoritative',
    audience: 'Working professionals and businesses aged 28-55 seeking financial growth',
    messages: 'Your money, your future — secured\nSmart investments for lasting wealth\nFinancial freedom starts here'
  },
  realestate: {
    industry: 'Real Estate', primary_color: '#b45309', secondary_color: '#1e293b',
    font_heading: 'Playfair Display', font_body: 'Lato', tone_of_voice: 'Professional',
    audience: 'Home buyers, investors and property seekers aged 28-55',
    messages: 'Find your perfect home\nInvest in your dream property\nTrusted guidance every step of the way'
  },
  retail: {
    industry: 'Retail', primary_color: '#dc2626', secondary_color: '#f59e0b',
    font_heading: 'Poppins', font_body: 'Open Sans', tone_of_voice: 'Friendly',
    audience: 'Value-conscious shoppers aged 18-50 looking for quality products',
    messages: 'Best products, best prices\nShopping made simple and fun\nQuality you can trust, prices you love'
  },
  marketing: {
    industry: 'Marketing', primary_color: '#7c3aed', secondary_color: '#f97316',
    font_heading: 'Montserrat', font_body: 'Inter', tone_of_voice: 'Playful',
    audience: 'Business owners and entrepreneurs aged 25-45 wanting to grow their brand',
    messages: 'We grow your brand, you grow your business\nCreative strategies, real results\nYour brand deserves to be seen'
  },
  default: {
    industry: 'Other', primary_color: '#6366f1', secondary_color: '#8b5cf6',
    font_heading: 'Poppins', font_body: 'Inter', tone_of_voice: 'Professional',
    audience: 'Target customers who need your products or services',
    messages: 'Quality service you can trust\nYour satisfaction is our priority\nExcellence in everything we do'
  }
}

function detectCategory(text) {
  const t = text.toLowerCase()
  if (t.match(/fit|gym|health|weight|yoga|diet|nutrition|coach|exercise|workout/)) return 'fitness'
  if (t.match(/food|restaurant|cafe|bakery|cook|eat|meal|snack|beverage|drink|kitchen/)) return 'food'
  if (t.match(/tech|software|app|digital|it |website|code|develop|cyber|ai|saas|cloud/)) return 'tech'
  if (t.match(/school|college|tutor|learn|teach|education|course|training|study|class/)) return 'education'
  if (t.match(/fashion|cloth|wear|style|boutique|dress|outfit|apparel|luxury/)) return 'fashion'
  if (t.match(/finance|invest|money|bank|loan|insurance|wealth|stock|fund|accounting/)) return 'finance'
  if (t.match(/real estate|property|house|home|rent|flat|apartment|plot|land/)) return 'realestate'
  if (t.match(/shop|store|retail|sell|product|ecommerce|mart|bazaar/)) return 'retail'
  if (t.match(/market|advertis|brand|social media|seo|content|growth|agency/)) return 'marketing'
  return 'default'
}

function extractBusinessName(text) {
  const match = text.match(/(?:called|named|name is|my business is|brand is)\s+["']?([A-Za-z0-9\s]+)["']?/i)
  if (match) return match[1].trim()
  const words = text.trim().split(' ')
  if (words.length <= 3) return text.trim()
  return ''
}

export default function BrandKit({ user }) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [businessDesc, setBusinessDesc] = useState('')
  const [generated, setGenerated] = useState(false)
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

  useEffect(() => { loadBrandKit() }, [])

  const loadBrandKit = async () => {
    const { data } = await supabase.from('brand_kit').select('*').eq('user_id', user.id).single()
    if (data) setForm(data)
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: existing } = await supabase.from('brand_kit').select('id').eq('user_id', user.id).single()
    if (existing) {
      await supabase.from('brand_kit').update({ ...form, updated_at: new Date() }).eq('user_id', user.id)
    } else {
      await supabase.from('brand_kit').insert({ ...form, user_id: user.id })
    }
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const generateWithAI = () => {
    if (!businessDesc.trim()) return
    setAiLoading(true)
    setGenerated(false)

    setTimeout(() => {
      const category = detectCategory(businessDesc)
      const data = industryData[category]
      const detectedName = extractBusinessName(businessDesc)

      setForm(prev => ({
        ...prev,
        business_name: detectedName || prev.business_name,
        industry: data.industry,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        font_heading: data.font_heading,
        font_body: data.font_body,
        tone_of_voice: data.tone_of_voice,
        target_audience: data.audience,
        key_messages: data.messages,
      }))

      setAiLoading(false)
      setGenerated(true)
    }, 1500)
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

      {/* AI Generator */}
      <div style={{ ...sectionStyle, background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)', border: '1px solid #c7d2fe' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: '#4338ca' }}>✨ AI Brand Generator</h2>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>Describe your business — AI will automatically fill your entire Brand Kit!</p>

        <textarea
          style={{ ...inputStyle, height: '90px', resize: 'vertical', border: '1px solid #c7d2fe', background: 'white' }}
          placeholder="e.g. I run a fitness coaching business that helps busy professionals lose weight and build healthy habits. Online sessions."
          value={businessDesc}
          onChange={e => { setBusinessDesc(e.target.value); setGenerated(false) }}
        />

        {generated && (
          <div style={{ marginTop: '10px', padding: '10px 14px', background: '#d1fae5', borderRadius: '8px', color: '#065f46', fontSize: '13px', fontWeight: '600' }}>
            ✅ Brand Kit generated successfully! Review the details below, make any edits, then click Save.
          </div>
        )}

        <button
          onClick={generateWithAI}
          disabled={aiLoading || !businessDesc.trim()}
          style={{ width: '100%', padding: '13px', marginTop: '12px', background: aiLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: aiLoading ? 'not-allowed' : 'pointer' }}
        >
          {aiLoading ? '🤖 Generating your Brand Kit...' : '🚀 Generate Brand Kit with AI'}
        </button>
      </div>

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
        <div style={{ marginTop: '16px', borderRadius: '10px', overflow: 'hidden', height: '50px', display: 'flex' }}>
          <div style={{ flex: 1, background: form.primary_color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>Primary</span>
          </div>
          <div style={{ flex: 1, background: form.secondary_color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>Secondary</span>
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
            <p style={{ fontSize: '18px', fontWeight: '700', fontFamily: form.font_heading, marginTop: '8px', color: '#1e1b4b' }}>Heading Preview</p>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Body Font</label>
            <select style={inputStyle} value={form.font_body} onChange={e => setForm({ ...form, font_body: e.target.value })}>
              {fonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <p style={{ fontSize: '14px', fontFamily: form.font_body, marginTop: '8px', color: '#6b7280' }}>Body text preview here</p>
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

      <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
        {loading ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save Brand Kit'}
      </button>
    </div>
  )
}