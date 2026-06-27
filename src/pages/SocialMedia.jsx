import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const platforms = [
  { id: 'instagram', label: 'Instagram', color: '#e1306c', icon: '📸', maxChars: 2200 },
  { id: 'facebook', label: 'Facebook', color: '#1877f2', icon: '👤', maxChars: 63206 },
  { id: 'twitter', label: 'Twitter/X', color: '#1da1f2', icon: '🐦', maxChars: 280 },
  { id: 'linkedin', label: 'LinkedIn', color: '#0077b5', icon: '💼', maxChars: 3000 },
]

// ---------- FREE RULE-BASED AI POST GENERATOR (no API, no payment) ----------

const hashtagBank = {
  fitness: ['#FitnessGoals', '#HealthyLiving', '#WorkoutMotivation', '#FitLife', '#GymTime', '#TransformationTuesday'],
  food: ['#Foodie', '#Delicious', '#FoodLover', '#FreshFood', '#InstaFood', '#TasteTheDifference'],
  tech: ['#TechInnovation', '#DigitalTransformation', '#TechSolutions', '#Innovation', '#FutureTech', '#SaaS'],
  education: ['#Learning', '#Education', '#StudySmart', '#SkillUp', '#KnowledgeIsPower', '#GrowthMindset'],
  fashion: ['#Fashion', '#Style', '#OOTD', '#FashionForward', '#TrendAlert', '#StyleInspo'],
  finance: ['#FinancialFreedom', '#SmartInvesting', '#MoneyMatters', '#WealthBuilding', '#FinanceTips'],
  realestate: ['#RealEstate', '#DreamHome', '#PropertyInvestment', '#HomeSweetHome', '#RealtorLife'],
  retail: ['#ShopNow', '#NewArrivals', '#BestDeals', '#ShoppingTime', '#QualityProducts'],
  marketing: ['#DigitalMarketing', '#BrandGrowth', '#MarketingTips', '#GrowYourBrand', '#ContentStrategy'],
  jobs: ['#JobOpportunity', '#CareerGrowth', '#Hiring', '#NowHiring', '#JobSearch', '#CareerOpportunity'],
  default: ['#SmallBusiness', '#Entrepreneur', '#Growth', '#Quality', '#CustomerFirst', '#Trusted'],
}

function matchIndustry(text) {
  const source = text.toLowerCase()
  if (source.match(/fit|gym|health|weight|yoga|diet|nutrition|coach|exercise|workout/)) return 'fitness'
  if (source.match(/food|restaurant|cafe|bakery|cook|eat|meal|snack|beverage|drink|kitchen|cake|bites|bakes/)) return 'food'
  if (source.match(/tech|software|app|digital|website|code|develop|cyber|\bai\b|saas|cloud|technical|programming|developer|engineer/)) return 'tech'
  if (source.match(/school|college|tutor|learn|teach|education|course|training|study|class/)) return 'education'
  if (source.match(/fashion|cloth|wear|style|boutique|dress|outfit|apparel|luxury/)) return 'fashion'
  if (source.match(/finance|invest|money|bank|loan|insurance|wealth|stock|fund/)) return 'finance'
  if (source.match(/real estate|property|house|home|rent|flat|apartment|plot/)) return 'realestate'
  if (source.match(/shop|store|retail|sell|product|ecommerce|mart|bazaar/)) return 'retail'
  if (source.match(/market|advertis|brand|social media|seo|content|agency/)) return 'marketing'
  if (source.match(/job|career|opportunit|hiring|recruit|vacancy|placement/)) return 'jobs'
  return null
}

// Topic gets priority — if the topic itself clearly points to an industry,
// use that. Only fall back to the Brand Kit's saved industry when the
// topic itself is too generic to tell ("new update", "weekend offer", etc.)
function detectIndustryFromText(text, brandKit) {
  const fromTopic = matchIndustry(text)
  if (fromTopic) return fromTopic

  const fromBrandKit = matchIndustry(brandKit?.industry || '')
  if (fromBrandKit) return fromBrandKit

  return 'default'
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildPostText({ platformId, topic, business, audience, tone }) {
  const t = topic.trim()

  const igTemplates = [
    `✨ ${t} ✨\n\nHey ${business ? `${business} family` : 'everyone'}! We're so excited to share this with you 🙌\n\n${t} — and we think you're going to love it! 💜\n\nDouble tap if you're excited too! 👇`,
    `🔥 Big update from ${business || 'us'}! 🔥\n\n${t}\n\nThis one's for ${audience || 'all of you amazing people'} who've been asking for more 💫\n\nDrop a comment and let us know what you think! 💬👇`,
    `📌 ${t}\n\nWe built this with ${audience || 'you'} in mind. Swipe through, save this post, and tag a friend who needs to see this! 🙏✨`,
  ]

  const fbTemplates = [
    `Hi everyone! 👋\n\nWe wanted to share something exciting: ${t}\n\nAt ${business || 'our business'}, we're always working to do better for ${audience || 'our community'}. We hope this makes a real difference for you!\n\nFeel free to share your thoughts in the comments below — we read every single one. 💬`,
    `${business ? `${business} here! ` : ''}Here's some good news 🎉\n\n${t}\n\nThank you for being part of our journey. Your support means everything, and we can't wait for you to experience this. Tag someone who'd love to know! 👇`,
  ]

  const twTemplates = [
    `${t} 🚀`,
    `Big news: ${t}. That's it, that's the tweet. 🔥`,
    `${business ? `${business}: ` : ''}${t} — more details soon 👀`,
    `We don't usually do this, but: ${t} 💯`,
  ]

  const liTemplates = [
    `I'm pleased to share an update from ${business || 'our team'}.\n\n${t}\n\nThis reflects our continued commitment to delivering value for ${audience || 'our clients and partners'}. ${tone === 'Authoritative' ? 'We remain focused on measurable results and long-term trust.' : 'We look forward to growing alongside our community.'}\n\nWould love to hear your thoughts in the comments.`,
    `At ${business || 'our company'}, we believe in continuous improvement.\n\n${t}\n\nThis initiative is designed specifically for ${audience || 'professionals in our industry'}. If this resonates with your goals, let's connect.`,
  ]

  if (platformId === 'instagram') return pick(igTemplates)
  if (platformId === 'facebook') return pick(fbTemplates)
  if (platformId === 'twitter') return pick(twTemplates)
  if (platformId === 'linkedin') return pick(liTemplates)
  return t
}

function generateFreePosts({ topic, selectedPlatforms, brandKit }) {
  const topicIndustry = matchIndustry(topic)
  const brandIndustry = matchIndustry(brandKit?.industry || '')
  const industry = topicIndustry || brandIndustry || 'default'

  // Only attach the Brand Kit's audience/tone when the topic's industry
  // actually matches the brand's own industry (or the topic was too
  // generic to tell either way). If the topic clearly belongs to a
  // different industry than the brand (e.g. a cake shop posting about a
  // job opening), the brand's audience ("food lovers...") doesn't apply
  // to that post, so we drop it and use generic phrasing instead.
  // The business name still applies either way — it's still your business posting.
  const brandContextApplies = !topicIndustry || topicIndustry === brandIndustry

  const business = brandKit?.business_name || ''
  const audience = brandContextApplies ? (brandKit?.target_audience || '') : ''
  const tone = brandContextApplies ? (brandKit?.tone_of_voice || '') : ''

  const result = {}
  selectedPlatforms.forEach(id => {
    const platform = platforms.find(p => p.id === id)
    let text = buildPostText({ platformId: id, topic, business, audience, tone })
    if (platform && text.length > platform.maxChars) {
      text = text.slice(0, platform.maxChars - 1) + '…'
    }
    result[id] = text
  })

  const tags = hashtagBank[industry] || hashtagBank.default
  const shuffled = [...tags].sort(() => Math.random() - 0.5)
  result.hashtags = shuffled.slice(0, 6).join(' ')

  return result
}

// ------------------------------------------------------------------------------

export default function SocialMedia({ user }) {
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [activePlatform, setActivePlatform] = useState(null)
  const [generatedPosts, setGeneratedPosts] = useState({})
  const [scheduleType, setScheduleType] = useState('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [brandKit, setBrandKit] = useState(null)
  const [hashtags, setHashtags] = useState('')

  useEffect(() => {
    loadPosts()
    loadBrandKit()
  }, [])

  const loadPosts = async () => {
    const { data } = await supabase.from('social_posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  const loadBrandKit = async () => {
    const { data } = await supabase.from('brand_kit').select('*').eq('user_id', user.id).single()
    if (data) setBrandKit(data)
  }

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
    if (!activePlatform) setActivePlatform(id)
  }

  const generateAIPost = () => {
    if (!topic.trim() || selectedPlatforms.length === 0) return
    setAiLoading(true)

    // Simulated "AI thinking" delay — same UX pattern as Brand Kit generator
    setTimeout(() => {
      const parsed = generateFreePosts({ topic, selectedPlatforms, brandKit })

      setGeneratedPosts(parsed)
      setHashtags(parsed.hashtags || '')
      if (selectedPlatforms[0]) {
        setActivePlatform(selectedPlatforms[0])
        setContent(parsed[selectedPlatforms[0]] || '')
      }
      setAiLoading(false)
    }, 1200)
  }

  const handlePlatformTab = (id) => {
    setActivePlatform(id)
    setContent(generatedPosts[id] || '')
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
    setTopic('')
    setSelectedPlatforms([])
    setGeneratedPosts({})
    setHashtags('')
    setActivePlatform(null)
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

  const activePlatformData = platforms.find(p => p.id === activePlatform)
  const charCount = content.length
  const maxChars = activePlatformData?.maxChars || 500
  const isOverLimit = charCount > maxChars

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' }}>Social Media</h1>
      <p style={{ color: '#6b7280', marginBottom: '12px' }}>AI-powered posts for all your platforms — tailored to your brand.</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '20px', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#92400e' }}>🧪 Prototype Mode — posts are saved to your queue, not yet published live to real social accounts</span>
      </div>

      {/* AI Post Generator */}
      <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderRadius: '12px', padding: '24px', marginBottom: '20px', border: '1px solid #c7d2fe', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: '#4338ca' }}>✨ AI Post Generator</h2>
        {brandKit?.business_name && (
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Using brand: <strong>{brandKit.business_name}</strong> · Tone: <strong>{brandKit.tone_of_voice}</strong>
          </p>
        )}

        <input
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #c7d2fe', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', background: 'white' }}
          placeholder="What do you want to post about? e.g. New product launch, weekend offer, customer success story..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />

        <label style={{ fontSize: '13px', fontWeight: '600', color: '#4338ca', display: 'block', marginBottom: '8px' }}>Select Platforms to Generate For:</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {platforms.map(p => (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              style={{ padding: '8px 16px', borderRadius: '20px', border: `2px solid ${p.color}`, background: selectedPlatforms.includes(p.id) ? p.color : 'white', color: selectedPlatforms.includes(p.id) ? 'white' : p.color, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <button onClick={generateAIPost} disabled={aiLoading || !topic.trim() || selectedPlatforms.length === 0}
          style={{ width: '100%', padding: '13px', background: aiLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: aiLoading ? 'not-allowed' : 'pointer' }}>
          {aiLoading ? '🤖 AI is writing your posts...' : '🚀 Generate Posts with AI'}
        </button>
      </div>

      {/* Post Composer */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>✍️ Post Composer</h2>

        {/* Platform Tabs */}
        {Object.keys(generatedPosts).length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {selectedPlatforms.map(id => {
              const p = platforms.find(pl => pl.id === id)
              return (
                <button key={id} onClick={() => handlePlatformTab(id)}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: `2px solid ${p.color}`, background: activePlatform === id ? p.color : 'white', color: activePlatform === id ? 'white' : p.color, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  {p.icon} {p.label}
                </button>
              )
            })}
          </div>
        )}

        <textarea
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${isOverLimit ? '#ef4444' : '#e2e8f0'}`, fontSize: '14px', height: '140px', resize: 'vertical', boxSizing: 'border-box' }}
          placeholder="Write your post here or generate with AI above..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {activePlatformData && `${activePlatformData.icon} ${activePlatformData.label} limit: ${maxChars.toLocaleString()} chars`}
          </span>
          <span style={{ fontSize: '12px', color: isOverLimit ? '#ef4444' : '#6b7280', fontWeight: isOverLimit ? '700' : '400' }}>
            {charCount}/{maxChars}
          </span>
        </div>

        {/* Hashtags */}
        {hashtags && (
          <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '14px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534' }}>🏷️ Suggested Hashtags: </span>
            <span style={{ fontSize: '12px', color: '#15803d' }}>{hashtags}</span>
          </div>
        )}

        {/* Schedule */}
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>When to Post?</label>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', marginBottom: '14px' }}>
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
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' }} />
        )}

        <button onClick={handlePost} disabled={loading || !content.trim() || selectedPlatforms.length === 0 || isOverLimit}
          style={{ width: '100%', padding: '14px', background: loading ? '#a5b4fc' : '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          {loading ? 'Saving...' : saved ? '✅ Saved!' : scheduleType === 'now' ? '🚀 Post Now' : '📅 Schedule Post'}
        </button>
      </div>

      {/* Post Queue */}
      {posts.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          No posts yet. Generate your first AI post above! 🚀
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#374151' }}>📋 Post Queue</h2>
          {posts.map(post => (
            <div key={post.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#374151', flex: 1, whiteSpace: 'pre-wrap' }}>{post.content}</p>
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