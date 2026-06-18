import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const audienceOptions = [
  'All Subscribers',
  'New Leads',
  'Existing Customers',
  'Inactive Users',
  'VIP Customers',
  'Trial Users',
]

const statusColor = {
  draft: { bg: '#f3f4f6', color: '#6b7280' },
  scheduled: { bg: '#fef3c7', color: '#92400e' },
  sent: { bg: '#d1fae5', color: '#065f46' },
}

export default function EmailCampaigns({ user }) {
  const [campaigns, setCampaigns] = useState([])
  const [view, setView] = useState('list') // 'list' | 'compose'
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [improving, setImproving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const [form, setForm] = useState({
    campaign_name: '',
    subject_line: '',
    email_body: '',
    audience: '',
    status: 'draft',
    scheduled_at: '',
  })

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    const { data } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setCampaigns(data)
  }

  const resetForm = () => {
    setForm({
      campaign_name: '',
      subject_line: '',
      email_body: '',
      audience: '',
      status: 'draft',
      scheduled_at: '',
    })
    setEditingId(null)
    setPreviewMode(false)
  }

  const openNew = () => {
    resetForm()
    setView('compose')
  }

  const openEdit = (campaign) => {
    setForm({
      campaign_name: campaign.campaign_name || '',
      subject_line: campaign.subject_line || '',
      email_body: campaign.email_body || '',
      audience: campaign.audience || '',
      status: campaign.status || 'draft',
      scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '',
    })
    setEditingId(campaign.id)
    setPreviewMode(false)
    setView('compose')
  }

  const handleSave = async (statusOverride) => {
    if (!form.campaign_name.trim() || !form.subject_line.trim()) {
      alert('Please fill in Campaign Name and Subject Line.')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      status: statusOverride || form.status,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      user_id: user.id,
    }

    if (editingId) {
      await supabase.from('email_campaigns').update(payload).eq('id', editingId)
    } else {
      await supabase.from('email_campaigns').insert(payload)
    }

    await loadCampaigns()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setView('list')
    resetForm()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return
    await supabase.from('email_campaigns').delete().eq('id', id)
    await loadCampaigns()
  }

  // AI Improve via Pollinations text model
  const handleAIImprove = async () => {
    if (!form.email_body.trim() && !form.subject_line.trim()) {
      alert('Please write some email content first.')
      return
    }
    setImproving(true)
    try {
      const prompt = `You are an expert email marketing copywriter. Improve the following email for better engagement, clarity, and conversion. Keep it professional yet warm. Return ONLY the improved email body text, nothing else.

Subject line: ${form.subject_line}

Email body:
${form.email_body}`

      const encodedPrompt = encodeURIComponent(prompt)
      const response = await fetch(
        `https://text.pollinations.ai/${encodedPrompt}`,
        { method: 'GET' }
      )
      const improved = await response.text()
      if (improved && improved.trim()) {
        setForm(prev => ({ ...prev, email_body: improved.trim() }))
      }
    } catch (err) {
      alert('AI improvement failed. Please try again.')
    }
    setImproving(false)
  }

  const handleAISuggestSubject = async () => {
    if (!form.email_body.trim()) {
      alert('Please write some email content first.')
      return
    }
    setImproving(true)
    try {
      const prompt = `Based on this email body, write a single compelling email subject line (max 60 characters). Return ONLY the subject line text, nothing else.

Email body:
${form.email_body}`

      const encodedPrompt = encodeURIComponent(prompt)
      const response = await fetch(
        `https://text.pollinations.ai/${encodedPrompt}`,
        { method: 'GET' }
      )
      const suggested = await response.text()
      if (suggested && suggested.trim()) {
        setForm(prev => ({ ...prev, subject_line: suggested.trim().replace(/^["']|["']$/g, '') }))
      }
    } catch (err) {
      alert('AI suggestion failed. Please try again.')
    }
    setImproving(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: 'white',
    color: '#1e1b4b',
  }
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }
  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  }

  // ── LIST VIEW ──────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e1b4b', margin: 0 }}>Email Campaigns</h1>
            <p style={{ color: '#6b7280', marginTop: '6px' }}>Create, schedule and track your email campaigns.</p>
          </div>
          <button onClick={openNew}
            style={{ padding: '12px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + New Campaign
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Campaigns', value: campaigns.length, icon: '📧' },
            { label: 'Scheduled', value: campaigns.filter(c => c.status === 'scheduled').length, icon: '⏰' },
            { label: 'Sent', value: campaigns.filter(c => c.status === 'sent').length, icon: '✅' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e1b4b' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Campaign List */}
        {campaigns.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>No campaigns yet. Create your first one!</p>
            <button onClick={openNew}
              style={{ marginTop: '16px', padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              + Create Campaign
            </button>
          </div>
        ) : (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>All Campaigns</h2>
            {campaigns.map(c => {
              const st = statusColor[c.status] || statusColor.draft
              return (
                <div key={c.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b4b' }}>{c.campaign_name}</span>
                        <span style={{ padding: '2px 10px', borderRadius: '12px', background: st.bg, color: st.color, fontSize: '11px', fontWeight: '600' }}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>Subject: {c.subject_line}</p>
                      {c.audience && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>👥 {c.audience}</p>}
                      {c.scheduled_at && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>
                          📅 {new Date(c.scheduled_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => openEdit(c)}
                        style={{ padding: '6px 14px', background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── COMPOSE VIEW ────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => { setView('list'); resetForm() }}
          style={{ padding: '8px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e1b4b', margin: 0 }}>
            {editingId ? 'Edit Campaign' : 'New Campaign'}
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Left: Form */}
        <div style={{ flex: '1', minWidth: '300px' }}>

          {/* Campaign Info */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>📋 Campaign Details</h2>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Campaign Name</label>
              <input style={inputStyle} placeholder="e.g. June Newsletter" value={form.campaign_name}
                onChange={e => setForm({ ...form, campaign_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Audience</label>
              <select style={inputStyle} value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                <option value="">Select audience</option>
                {audienceOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </select>
            </div>
            {form.status === 'scheduled' && (
              <div>
                <label style={labelStyle}>Schedule Date & Time</label>
                <input type="datetime-local" style={inputStyle} value={form.scheduled_at}
                  onChange={e => setForm({ ...form, scheduled_at: e.target.value })} />
              </div>
            )}
          </div>

          {/* Subject Line */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', margin: 0 }}>✉️ Subject Line</h2>
              <button onClick={handleAISuggestSubject} disabled={improving}
                style={{ padding: '6px 12px', background: improving ? '#e0e7ff' : '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: '6px', cursor: improving ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: '600' }}>
                {improving ? '⏳ Working...' : '✨ AI Suggest'}
              </button>
            </div>
            <input style={inputStyle} placeholder="e.g. Big news — here's what's new this month 🎉"
              value={form.subject_line} onChange={e => setForm({ ...form, subject_line: e.target.value })} />
            <p style={{ fontSize: '11px', color: form.subject_line.length > 60 ? '#ef4444' : '#9ca3af', marginTop: '6px', textAlign: 'right' }}>
              {form.subject_line.length}/60 characters
            </p>
          </div>

          {/* Email Body */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', margin: 0 }}>📝 Email Body</h2>
              <button onClick={handleAIImprove} disabled={improving}
                style={{ padding: '6px 12px', background: improving ? '#e0e7ff' : '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: improving ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: '600' }}>
                {improving ? '⏳ Improving...' : '✨ AI Improve'}
              </button>
            </div>
            <textarea style={{ ...inputStyle, height: '200px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
              placeholder={`Hi [First Name],\n\nWrite your email here...\n\nBest regards,\nYour Team`}
              value={form.email_body}
              onChange={e => setForm({ ...form, email_body: e.target.value })} />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleSave('draft')} disabled={saving}
              style={{ flex: 1, padding: '13px', background: 'white', color: '#6366f1', border: '2px solid #6366f1', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : '💾 Save Draft'}
            </button>
            <button onClick={() => handleSave(form.status === 'draft' ? 'scheduled' : form.status)} disabled={saving}
              style={{ flex: 1, padding: '13px', background: saving ? '#a5b4fc' : '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saved ? '✅ Saved!' : saving ? 'Saving...' : form.status === 'draft' ? '📅 Save & Schedule' : '✅ Save Campaign'}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div style={{ flex: '1', minWidth: '280px' }}>
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', margin: 0 }}>👁️ Live Preview</h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setPreviewMode(false)}
                  style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: !previewMode ? '#6366f1' : 'white', color: !previewMode ? 'white' : '#374151', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                  Desktop
                </button>
                <button onClick={() => setPreviewMode(true)}
                  style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: previewMode ? '#6366f1' : 'white', color: previewMode ? 'white' : '#374151', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                  Mobile
                </button>
              </div>
            </div>

            {/* Email preview render */}
            <div style={{
              maxWidth: previewMode ? '320px' : '100%',
              margin: '0 auto',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#f8fafc',
            }}>
              {/* Email client header */}
              <div style={{ background: '#374151', padding: '8px 12px', display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              </div>
              {/* From/Subject bar */}
              <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>From: <span style={{ color: '#374151' }}>Your Business &lt;hello@yourdomain.com&gt;</span></p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '700', color: '#1e1b4b' }}>
                  {form.subject_line || 'Your Subject Line Here'}
                </p>
              </div>
              {/* Email body preview */}
              <div style={{ padding: '20px 16px', background: 'white', minHeight: '160px' }}>
                {form.email_body ? (
                  <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {form.email_body}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', paddingTop: '32px' }}>
                    <p style={{ color: '#d1d5db', fontSize: '13px' }}>Your email content will appear here...</p>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>Unsubscribe · View in browser</p>
              </div>
            </div>

            {/* Audience badge */}
            {form.audience && (
              <div style={{ marginTop: '16px', padding: '10px 14px', background: '#eef2ff', borderRadius: '8px', fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>
                👥 Sending to: {form.audience}
              </div>
            )}
          </div>

          {/* Tips Panel */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>💡 Email Tips</h3>
            {[
              { tip: 'Keep subject lines under 60 characters for best open rates.' },
              { tip: 'Personalize with [First Name] to increase engagement by up to 26%.' },
              { tip: 'One clear call-to-action performs better than multiple links.' },
              { tip: 'Send Tuesday–Thursday at 10 AM for highest open rates.' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <span style={{ color: '#6366f1', fontWeight: '700', flexShrink: 0 }}>→</span>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}