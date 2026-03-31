import { useState } from 'react'
import type { CreatorProfile } from '../App'
import type { StoredProfile } from '../lib/profiles'
import type { Campaign } from '../lib/campaigns'
import { InfoTip } from './InfoTip'
import { ProfileSelector } from './ProfileSelector'

type Props = {
  profile: CreatorProfile
  profiles?: StoredProfile[]
  activeProfileId?: string
  onProfileSwitch?: (id: string) => void
  saveCampaign?: (c: Omit<Campaign, 'id' | 'createdAt'>) => Promise<Campaign>
}

type VideoMode = 'text-to-video' | 'image-to-video'
type AspectRatio = '9:16' | '16:9' | '1:1'
type Duration = '5' | '10'

const CONTENT_TYPES = [
  { id: 'hook',       label: '🎬 Reel Hook',      desc: '3–5s pattern interrupt opener' },
  { id: 'lifestyle',  label: '🌟 Lifestyle Clip',  desc: 'Aspirational b-roll' },
  { id: 'product',    label: '📦 Product Demo',    desc: 'Show the offer in action' },
  { id: 'transition', label: '✨ Transition',       desc: 'Before/after reveal' },
  { id: 'custom',     label: '✍️ Custom',            desc: 'Write your own prompt' },
]

const STYLE_PRESETS = [
  'Cinematic, shallow depth of field, warm golden hour light',
  'Clean corporate, bright studio lighting, professional',
  'Dark moody, dramatic shadows, premium brand feel',
  'Documentary style, natural light, authentic',
  'High energy, fast cuts, dynamic camera movement',
]

async function generateVideoFal(
  prompt: string,
  imageUrl: string | null,
  aspect: AspectRatio,
  duration: Duration,
  falKey: string
): Promise<string> {
  const endpoint = imageUrl
    ? 'https://fal.run/fal-ai/kling-video/v2.1/image-to-video'
    : 'https://fal.run/fal-ai/kling-video/v2.1/standard/text-to-video'

  const body: Record<string, string> = {
    prompt,
    duration,
    aspect_ratio: aspect,
  }
  if (imageUrl) body.image_url = imageUrl

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${falKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `FAL API error ${res.status}`)
  }

  const data = await res.json()
  return data.video?.url || data.url || ''
}

async function buildVideoPrompt(
  topic: string,
  contentType: string,
  style: string,
  niche: string,
  openrouterKey: string
): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openrouterKey}`,
      'HTTP-Referer': 'https://socialrevenueengine.app',
      'X-Title': 'Social Revenue Engine',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [{
        role: 'user',
        content: `Write a short video generation prompt (max 60 words) for:
Topic: ${topic}
Content type: ${contentType}
Visual style: ${style}
Creator niche: ${niche}

Return ONLY the prompt. No preamble. Focus on visual description, camera movement, lighting, mood.`,
      }],
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || topic
}

export function VideoGenerator({ profile, profiles = [], activeProfileId = '', onProfileSwitch, saveCampaign }: Props) {
  const [mode, setMode]               = useState<VideoMode>('text-to-video')
  const [contentType, setContentType] = useState('hook')
  const [topic, setTopic]             = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [style, setStyle]             = useState(STYLE_PRESETS[0])
  const [aspect, setAspect]           = useState<AspectRatio>('9:16')
  const [duration, setDuration]       = useState<Duration>('5')
  const [imageUrl, setImageUrl]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [buildingPrompt, setBuildingPrompt] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [videoUrl, setVideoUrl]       = useState('')
  const [error, setError]             = useState('')
  const [gallery, setGallery]         = useState<{ url: string; prompt: string }[]>([])
  const [vidSaved, setVidSaved]       = useState(false)

  const falKey = localStorage.getItem('sre_fal_key') || ''
  const orKey  = localStorage.getItem('sre_or_key') || ''

  const generate = async () => {
    if (!falKey) { setError('FAL.ai API key required. Click ⚙ API Keys to add it.'); return }
    if (!topic && contentType !== 'custom') { return }
    if (contentType === 'custom' && !customPrompt) { return }
    if (mode === 'image-to-video' && !imageUrl) { return }

    setLoading(true)
    setError('')
    setVideoUrl('')

    try {
      let finalPrompt = ''

      if (contentType === 'custom') {
        finalPrompt = customPrompt
      } else if (orKey) {
        setBuildingPrompt(true)
        finalPrompt = await buildVideoPrompt(topic, contentType, style, profile.niche, orKey)
        setBuildingPrompt(false)
      } else {
        finalPrompt = `${topic}. ${style}. ${aspect === '9:16' ? 'Vertical format.' : ''}`
      }

      setGeneratedPrompt(finalPrompt)

      const url = await generateVideoFal(
        finalPrompt,
        mode === 'image-to-video' ? imageUrl : null,
        aspect,
        duration,
        falKey
      )

      setVideoUrl(url)
      setGallery(prev => [{ url, prompt: finalPrompt }, ...prev.slice(0, 5)])
    } catch (e: unknown) {
      setBuildingPrompt(false)
      setError(e instanceof Error ? e.message : 'Generation failed')
    }

    setLoading(false)
    setBuildingPrompt(false)
  }

  const costEst = `~$${(parseFloat(duration) * 0.029).toFixed(2)}`

  return (
    <div>
      <div className="page-title">Video Generator</div>
      <div className="page-sub">
        Kling 3.0 via <span style={{ color: 'var(--gold)' }}>FAL.ai</span> · {costEst}/clip ·{' '}
        Prompts built free via DeepSeek V3
      </div>

      {!falKey && (
        <div style={{
          background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.25)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 20,
          fontSize: 13, color: '#f87171',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span>⚠</span>
          <span>FAL.ai API key not set. <strong>Click ⚙ API Keys</strong> in the sidebar to add it.</span>
        </div>
      )}

      <div className="gen-layout" style={{ gridTemplateColumns: '300px 1fr' }}>
        {/* Controls */}
        <div className="gen-controls">
          <ProfileSelector profiles={profiles} activeId={activeProfileId} onSwitch={onProfileSwitch || (() => {})} />

          {/* Mode */}
          <div style={{ marginBottom: 18 }}>
            <div className="form-label">
              Mode
              <InfoTip text="Text → Video creates a clip from a description alone. Image → Video animates a still image you provide — great for bringing your Image Generator outputs to life with camera motion." />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['text-to-video', 'image-to-video'] as const).map(m => (
                <button key={m} className={`chip ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)} style={{ fontSize: 12 }}>
                  {m === 'text-to-video' ? '✍️ Text → Video' : '🖼 Image → Video'}
                </button>
              ))}
            </div>
          </div>

          {/* Content type */}
          <div style={{ marginBottom: 18 }}>
            <div className="form-label">
              Content Type
              <InfoTip text="The purpose of the clip. Reel Hook is a 3–5s pattern interrupt for your opening. Lifestyle Clip is aspirational b-roll. Product Demo shows your offer in action. Transition is a before/after reveal — high-engagement format." />
            </div>
            {CONTENT_TYPES.map(ct => (
              <div key={ct.id}
                onClick={() => setContentType(ct.id)}
                style={{
                  background: contentType === ct.id ? 'var(--gold-dim)' : 'var(--surface-2)',
                  border: `1px solid ${contentType === ct.id ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '9px 12px', marginBottom: 6,
                  cursor: 'pointer', transition: 'all .15s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                <span style={{ fontSize: 13, fontWeight: contentType === ct.id ? 700 : 500,
                  color: contentType === ct.id ? 'var(--gold)' : 'var(--text)' }}>
                  {ct.label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{ct.desc}</span>
              </div>
            ))}
          </div>

          {/* Topic or custom prompt */}
          {contentType === 'custom' ? (
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label">Custom Prompt</label>
              <textarea className="form-input" rows={4}
                placeholder="Describe exactly what you want to see..."
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label">
                Topic / Subject
                <InfoTip text="Brief description of what should happen in the video. DeepSeek V3 (free) crafts the detailed visual prompt — just describe the subject and story. The more specific, the better the result." />
              </label>
              <input className="form-input"
                placeholder={`e.g. ${profile.niche} insight`}
                value={topic} onChange={e => setTopic(e.target.value)} />
              {orKey && (
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>
                  Prompt auto-crafted by DeepSeek V3 (free)
                </div>
              )}
            </div>
          )}

          {/* Image URL for image-to-video */}
          {mode === 'image-to-video' && (
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label">
                Source Image URL
                <InfoTip text="A publicly accessible image URL to animate. Use an image generated in the Image Generator (right-click → copy image address) or any public URL. The AI will add realistic camera motion and life to the still." />
              </label>
              <input className="form-input" placeholder="https://..."
                value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>
          )}

          {/* Visual style */}
          {contentType !== 'custom' && (
            <div style={{ marginBottom: 18 }}>
              <div className="form-label">
                Visual Style
                <InfoTip text="The cinematographic look and feel. Cinematic = premium, aspirational brand. Documentary = authentic, relatable content. Corporate = professional B2B. High Energy = fast-paced social-first editing." />
              </div>
              {STYLE_PRESETS.map(s => (
                <button key={s} className={`chip ${style === s ? 'active' : ''}`}
                  onClick={() => setStyle(s)}
                  style={{ fontSize: 11, marginBottom: 6, marginRight: 6, textAlign: 'left', height: 'auto', whiteSpace: 'normal' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Aspect ratio */}
          <div style={{ marginBottom: 18 }}>
            <div className="form-label">
              Aspect Ratio
              <InfoTip text="9:16 is mandatory for Reels and TikTok — always use this for social-first content. 16:9 for YouTube. 1:1 for LinkedIn or Twitter feed posts." />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([['9:16', 'Reels'], ['16:9', 'YouTube'], ['1:1', 'Square']] as const).map(([ar, lbl]) => (
                <button key={ar} className={`chip ${aspect === ar ? 'active' : ''}`}
                  onClick={() => setAspect(ar as AspectRatio)}
                  style={{ flex: 1, flexDirection: 'column', padding: '8px 6px', fontSize: 12 }}>
                  <span style={{ fontWeight: 700 }}>{ar}</span>
                  <span style={{ fontSize: 10, opacity: .7 }}>{lbl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label">
              Duration
              <InfoTip text="5s is best for hooks and pattern interrupts — the algorithm rewards short, high-completion clips. 10s for fuller demos or lifestyle b-roll. Longer clips cost more and need higher production quality to retain viewers." />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([['5', '$0.15'], ['10', '$0.29']] as const).map(([d, cost]) => (
                <button key={d} className={`chip ${duration === d ? 'active' : ''}`}
                  onClick={() => setDuration(d as Duration)}
                  style={{ flex: 1, flexDirection: 'column', padding: '8px 6px', fontSize: 12 }}>
                  <span style={{ fontWeight: 700 }}>{d}s</span>
                  <span style={{ fontSize: 10, opacity: .7 }}>{cost}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={generate}
            disabled={loading || !falKey ||
              (!topic && contentType !== 'custom') ||
              (contentType === 'custom' && !customPrompt) ||
              (mode === 'image-to-video' && !imageUrl)}>
            {loading
              ? buildingPrompt ? '🧠 Building prompt…' : '🎬 Generating video…'
              : '🎬 Generate Video'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'monospace', fontSize: 11, color: 'var(--text-dim)' }}>
            Est. cost: {costEst} · Kling 3.0 via FAL.ai
          </div>
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="gen-output" style={{ minHeight: 360 }}>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Output · Kling 3.0
            </div>

            {!videoUrl && !loading && !error && (
              <div className="output-placeholder">
                <div className="output-placeholder-icon">🎬</div>
                <div style={{ fontSize: 15, fontFamily: 'Syne', fontWeight: 700 }}>Ready to generate</div>
                <div style={{ fontSize: 13, maxWidth: 300, textAlign: 'center', color: 'var(--text-dim)' }}>
                  Video generation takes 1–3 minutes. FAL.ai processes asynchronously — the URL will appear when ready.
                </div>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 16 }}>
                <div className="loading-pulse" style={{ justifyContent: 'center' }}>
                  <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center' }}>
                  {buildingPrompt
                    ? 'Crafting visual prompt with DeepSeek V3 (free)…'
                    : 'Generating with Kling 3.0 on FAL.ai… (1–3 min)'}
                </div>
                {!buildingPrompt && (
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', opacity: .7 }}>
                    Tip: you can keep using other modules while this processes
                  </div>
                )}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 10, padding: 16, color: '#f87171', fontSize: 13 }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {videoUrl && (
              <>
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  style={{ width: '100%', maxHeight: 420, borderRadius: 12, border: '1px solid var(--border)', background: '#000' }}
                />
                {generatedPrompt && (
                  <div style={{ marginTop: 14, background: 'var(--surface-2)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 5 }}>
                      {orKey ? 'Auto-generated prompt · DeepSeek V3 (free)' : 'Prompt used'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      {generatedPrompt}
                    </div>
                  </div>
                )}
                <div className="output-actions">
                  <a href={videoUrl} download="social-video.mp4" className="copy-btn" style={{ textDecoration: 'none' }}>⬇ Download</a>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(videoUrl)}>⧉ Copy URL</button>
                  <button className="copy-btn" onClick={() => {
                    const active = profiles.find(p => p.id === activeProfileId)
                    await saveCampaign?.({ type: 'video', profileId: activeProfileId, profileName: active?.name || profile.name, niche: profile.niche, title: topic || contentType, output: videoUrl })
                    setVidSaved(true); setTimeout(() => setVidSaved(false), 2000)
                  }}>{vidSaved ? '✓ Saved!' : '⊞ Save'}</button>
                  <button className="copy-btn" onClick={() => { setVideoUrl(''); setGeneratedPrompt('') }}>↺ Reset</button>
                  <button className="copy-btn" onClick={generate}>↻ Regenerate</button>
                </div>
              </>
            )}
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div className="strategy-box">
              <div className="section-title" style={{ marginBottom: 14 }}>Session Gallery</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {gallery.map((item, i) => (
                  <div key={i} style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => setVideoUrl(item.url)}>
                    <video src={item.url} muted
                      style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)', borderRadius: 8, opacity: 0, transition: 'opacity .2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <span style={{ fontSize: 24 }}>▶</span>
                    </div>
                    <a href={item.url} download={`video-${i}.mp4`}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: 4, color: 'white', fontSize: 12, padding: '2px 6px', textDecoration: 'none' }}
                      onClick={e => e.stopPropagation()}>⬇</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
