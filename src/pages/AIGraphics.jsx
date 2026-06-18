import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function AIGraphics({ user }) {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const { data } = await supabase
      .from('ai_graphics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setHistory(data)
  }

  const generateImage = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setBrightness(100)
    setContrast(100)

    const encodedPrompt = encodeURIComponent(prompt)
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`
    
    setImageUrl(url)

    await supabase.from('ai_graphics').insert({
      user_id: user.id,
      prompt: prompt,
      image_url: url,
      width: 1024,
      height: 1024
    })

    await loadHistory()
    setLoading(false)
  }

  const handleDownload = async () => {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `sineva-ai-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' }}>AI Graphics</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>Generate stunning images using AI — just describe what you want!</p>

      {/* Prompt Box */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Describe your image</label>
        <textarea
          style={{ ...inputStyle, height: '100px', resize: 'vertical', marginTop: '8px' }}
          placeholder="e.g. A professional logo for a tech startup with blue and purple colors, minimalist style"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          style={{ width: '100%', padding: '14px', background: loading ? '#a5b4fc' : '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '12px' }}
        >
          {loading ? '⏳ Generating... (please wait)' : '✨ Generate Image'}
        </button>
      </div>

      {/* Generated Image */}
      {imageUrl && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>Generated Image</h2>
          
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img
              src={imageUrl}
              alt="Generated"
              style={{ maxWidth: '100%', borderRadius: '8px', filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Brightness: {brightness}%</label>
              <input type="range" min="50" max="150" value={brightness} onChange={e => setBrightness(e.target.value)}
                style={{ width: '100%', marginTop: '6px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Contrast: {contrast}%</label>
              <input type="range" min="50" max="150" value={contrast} onChange={e => setContrast(e.target.value)}
                style={{ width: '100%', marginTop: '6px' }} />
            </div>
          </div>

          <button onClick={handleDownload}
            style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            ⬇️ Download Image
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>Generation History</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {history.map(item => (
              <div key={item.id} onClick={() => { setImageUrl(item.image_url); setPrompt(item.prompt) }}
                style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                <img src={item.image_url} alt={item.prompt} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                <p style={{ fontSize: '11px', color: '#6b7280', padding: '6px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}