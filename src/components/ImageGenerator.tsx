import { useState } from 'react'
import type { CreatorProfile } from '../App'
import type { StoredProfile } from '../lib/profiles'
import { generateImage, generateText, IMAGE_MODELS } from '../lib/ai'
import type { ImageModel } from '../lib/ai'
import type { Campaign } from '../lib/campaigns'
import { InfoTip } from './InfoTip'
import { ProfileSelector } from './ProfileSelector'

type Props = {
  profile: CreatorProfile
  profiles?: StoredProfile[]
  activeProfileId?: string
  onProfileSwitch?: (id: string) => void
  saveCampaign?: (c: Omit<Campaign, 'id' | 'createdAt'>) => Promise<Campaign>
  onOpenKeys?: () => void
}

type AspectRatio = '1:1' | '9:16' | '16:9' | '4:5'

const ASPECT_RATIOS: { value: AspectRatio; label: string; desc: string }[] = [
  { value: '1:1',  label: 'Square',    desc: 'Feed post' },
  { value: '9:16', label: 'Portrait',  desc: 'Reels / Stories' },
  { value: '16:9', label: 'Landscape', desc: 'YouTube / Shorts' },
  { value: '4:5',  label: '4:5',       desc: 'Instagram optimal' },
]

const CONTENT_TYPES = [
  { id: 'post-cover',  label: '📸 Post Cover',   prompt: 'professional social media post cover image, clean composition, brand aesthetic' },
  { id: 'carousel',   label: '📊 Carousel Slide', prompt: 'clean carousel slide design with clear typography, minimalist layout, readable text' },
  { id: 'quote',      label: '💬 Quote Card',    prompt: 'stylish quote card with bold typography, elegant background, motivational feel' },
  { id: 'product',    label: '🛍 Product Shot',   prompt: 'professional product photography style, clean background, commercial quality' },
  { id: 'lifestyle',  label: '🌟 Lifestyle',      prompt: 'authentic lifestyle photography, aspirational but relatable, warm lighting' },
  { id: 'custom',     label: '✍️ Custom Prompt',  prompt: '' },
]

const BADGE_COLORS: Record<string, string> = {
  CHEAPEST: 'rgba(74,222,128,0.15)',
  BALANCED: 'rgba(96,165,250,0.15)',
  TEXT:     'rgba(200,169,110,0.15)',
  PREMIUM:  'rgba(192,132,252,0.15)',
  FACES:    'rgba(251,146,60,0.15)',
  FAST:     'rgba(244,63,94,0.15)',
}

const BADGE_TEXT: Record<string, string> = {
  CHEAPEST: '#4ade80', BALANCED: '#60a5fa', TEXT: '#c8a96e',
  PREMIUM: '#c084fc', FACES: '#fb923c', FAST: '#f43f5e',
}

export function ImageGenerator({ profile, profiles = [], activeProfileId = '', onProfileSwitch, saveCampaign, onOpenKeys }: Props) {
  const [model, setModel] = useState<ImageModel>('nano-banana')
  const [contentType, setContentType] = useState('post-cover')
  const [aspect, setAspect] = useState<AspectRatio>('1:1')
  const [customPrompt, setCustomPrompt] = useState('')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [buildingPrompt, setBuildingPrompt] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [error, setError] = useState('')
  const [gallery, setGallery] = useState<{ url: string; prompt: string; model: string }[]>([])
  const [imgSaved, setImgSaved] = useState(false)

  const selectedContent = CONTENT_TYPES.find(c => c.id === contentType)!

  const buildAndGenerate = async () => {
    setLoading(true)
    setError('')
    setGeneratedImage(null)

    try {
      let finalPrompt = ''

      if (contentType === 'custom') {
        finalPrompt = customPrompt
      } else {
        setBuildingPrompt(true)
        const promptInstruction = `You are an expert at writing image generation prompts for social media content.

Creator niche: ${profile.niche}
Audience: ${profile.audience}
Content topic: ${topic || profile.niche}
Image type: ${selectedContent.label}
Base style: ${selectedContent.prompt}

Write a single, detailed image generation prompt (max 80 words) for this social media post.
Include: visual style, composition, colours, mood, lighting.
Do NOT include text overlays unless specifically asked for a quote card or carousel.
Return ONLY the prompt, nothing else.`

        finalPrompt = await generateText(promptInstruction, 'openrouter-free')
        setBuildingPrompt(false)
        setGeneratedPrompt(finalPrompt)
      }

      const imageUrl = await generateImage(finalPrompt, model, aspect)
      setGeneratedImage(imageUrl)
      setGallery(prev => [{ url: imageUrl, prompt: finalPrompt, model: IMAGE_MODELS[model].label }, ...prev.slice(0, 7)])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed'
      setError(msg)
      setBuildingPrompt(false)
      if (msg.toLowerCase().includes('key')) onOpenKeys?.()
    }

    setLoading(false)
    setBuildingPrompt(false)
  }

  const download = (url: string, idx: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `social-image-${idx + 1}.png`
    a.click()
  }

  return (
    <div>
      <div className="page-title">Image Generator</div>
      <div className="page-sub">
        All images via OpenRouter — one API key, per-image billing.{' '}
        <span style={{ color: 'var(--gold)' }}>Prompts built free via DeepSeek V3.</span>
      </div>

      <div className="gen-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Controls */}
        <div className="gen-controls">
          <ProfileSelector profiles={profiles} activeId={activeProfileId} onSwitch={onProfileSwitch || (() => {})} />

          {/* Model selector */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label">
              Model
              <InfoTip text="Which AI image model to use. Nano Banana (Gemini) is cheapest for quick social posts. FLUX is best for photorealistic shots. Seedream excels at faces and portraits. Riverflow handles text overlays best." />
            </div>
            {(Object.entries(IMAGE_MODELS) as [ImageModel, typeof IMAGE_MODELS[ImageModel]][]).map(([key, m]) => (
              <div key={key}
                onClick={() => setModel(key)}
                style={{
                  background: model === key ? 'var(--gold-dim)' : 'var(--surface-2)',
                  border: `1px solid ${model === key ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '10px 12px', marginBottom: 6,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: model === key ? 'var(--gold)' : 'var(--text)' }}>
                    {m.label}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 6px', borderRadius: 3,
                      background: BADGE_COLORS[m.badge], color: BADGE_TEXT[m.badge],
                      textTransform: 'uppercase'
                    }}>{m.badge}</span>
                    <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>{m.cost}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{m.bestFor}</div>
              </div>
            ))}
          </div>

          {/* Content type */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label">
              Content Type
              <InfoTip text="The format and purpose of the image. Post Cover is for feed thumbnails. Carousel Slide for multi-panel educational posts. Quote Card for text-based authority content. Lifestyle for aspirational, relatable imagery." />
            </div>
            <div className="chip-group" style={{ flexWrap: 'wrap' }}>
              {CONTENT_TYPES.map(ct => (
                <button key={ct.id} className={`chip ${contentType === ct.id ? 'active' : ''}`}
                  onClick={() => setContentType(ct.id)} style={{ fontSize: 12 }}>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic or custom prompt */}
          {contentType === 'custom' ? (
            <div className="form-group">
              <label className="form-label">Custom Prompt</label>
              <textarea className="form-input" rows={4}
                placeholder="Describe exactly what you want..."
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">
                Topic / Subject
                <InfoTip text="What the image should represent. DeepSeek V3 (free) builds the full visual prompt from your brief — you don't need to be a prompt engineer. The more specific the subject, the better the result." />
              </label>
              <input className="form-input"
                placeholder={`e.g. ${profile.niche} growth strategy`}
                value={topic}
                onChange={e => setTopic(e.target.value)} />
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                DeepSeek V3 (free) will craft the visual prompt for you
              </div>
            </div>
          )}

          {/* Aspect ratio */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label">
              Aspect Ratio
              <InfoTip text="Dimensions for your output. 9:16 for Reels and Stories. 1:1 for feed posts. 4:5 is Instagram-optimal for feed (shows larger). 16:9 for YouTube thumbnails or landscape posts." />
            </div>
            <div className="chip-group">
              {ASPECT_RATIOS.map(ar => (
                <button key={ar.value} className={`chip ${aspect === ar.value ? 'active' : ''}`}
                  onClick={() => setAspect(ar.value)}
                  style={{ fontSize: 12, flexDirection: 'column', padding: '8px 12px' }}>
                  <span style={{ fontWeight: 700 }}>{ar.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{ar.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={buildAndGenerate}
            disabled={loading || (!topic && contentType !== 'custom') || (contentType === 'custom' && !customPrompt)}>
            {loading
              ? buildingPrompt ? '🧠 Building prompt...' : '🎨 Generating image...'
              : '🎨 Generate Image'}
          </button>

          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
            Est. cost: {IMAGE_MODELS[model].cost} · via OpenRouter
          </div>
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="gen-output" style={{ minHeight: 400 }}>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Output · {IMAGE_MODELS[model].label}
            </div>

            {!generatedImage && !loading && (
              <div className="output-placeholder">
                <div style={{ fontSize: 48 }}>🎨</div>
                <div style={{ fontSize: 15, fontFamily: 'Syne', fontWeight: 700 }}>Ready to generate</div>
                <div style={{ fontSize: 13, maxWidth: 280, textAlign: 'center' }}>
                  Select a model, pick your content type, and hit generate.
                  Prompt is auto-crafted using free DeepSeek V3.
                </div>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
                <div className="loading-pulse" style={{ justifyContent: 'center' }}>
                  <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                  {buildingPrompt ? 'Crafting visual prompt with DeepSeek V3 (free)...' : `Generating with ${IMAGE_MODELS[model].label}...`}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 16, color: '#f87171', fontSize: 13 }}>
                <strong>Error:</strong> {error}
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
                  Check your OpenRouter API key is set and has credits.
                </div>
              </div>
            )}

            {generatedImage && (
              <>
                <img src={generatedImage} alt="Generated"
                  style={{ width: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 12, border: '1px solid var(--border)' }} />

                {generatedPrompt && (
                  <div style={{ marginTop: 16, background: 'var(--surface-2)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
                      Auto-generated prompt (DeepSeek V3, free)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>{generatedPrompt}</div>
                  </div>
                )}

                <div className="output-actions">
                  <button className="copy-btn" onClick={() => download(generatedImage, 0)}>⬇ Download</button>
                  <button className="copy-btn" onClick={async () => {
                    const active = profiles.find(p => p.id === activeProfileId)
                    await saveCampaign?.({ type: 'image', profileId: activeProfileId, profileName: active?.name || profile.name, niche: profile.niche, title: topic || contentType, output: generatedImage })
                    setImgSaved(true); setTimeout(() => setImgSaved(false), 2000)
                  }}>{imgSaved ? '✓ Saved!' : '⊞ Save'}</button>
                  <button className="copy-btn" onClick={() => { setGeneratedImage(null); setGeneratedPrompt('') }}>↺ Reset</button>
                  <button className="copy-btn" onClick={buildAndGenerate}>↻ Regenerate</button>
                </div>
              </>
            )}
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div className="strategy-box">
              <div className="section-title" style={{ marginBottom: 16 }}>Session Gallery</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {gallery.map((item, i) => (
                  <div key={i} style={{ cursor: 'pointer', position: 'relative' }}
                    onClick={() => setGeneratedImage(item.url)}>
                    <img src={item.url} alt={`Gallery ${i}`}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <div style={{
                      position: 'absolute', bottom: 4, left: 4, right: 4,
                      background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '3px 6px',
                      fontSize: 9, color: 'white', textAlign: 'center'
                    }}>{item.model}</div>
                    <button onClick={e => { e.stopPropagation(); download(item.url, i) }}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 4, color: 'white', fontSize: 12, cursor: 'pointer', padding: '2px 6px' }}>
                      ⬇
                    </button>
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
