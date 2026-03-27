import { useState } from 'react'
import type { CreatorProfile } from '../App'
import { streamText } from '../lib/ai'

type Props = { profile: CreatorProfile }

const STRUCTURES = [
  { id: 'tutorial',    label: 'How To / Tutorial',      icon: '📋' },
  { id: 'listicle',   label: 'Listicle',                icon: '🔢' },
  { id: 'storytime',  label: 'Storytime',               icon: '📖' },
  { id: 'pov',        label: 'POV / Scenario',          icon: '🎭' },
  { id: 'contrarian', label: 'Contrarian / Myth-Bust',  icon: '🔥' },
  { id: 'testimonial',label: 'Social Proof',            icon: '⭐' },
  { id: 'reaction',   label: 'Reaction / Commentary',   icon: '💬' },
]

const PILLARS = [
  { id: 'educate',   label: 'Educate',          color: '#60a5fa' },
  { id: 'entertain', label: 'Entertain/Relate',  color: '#c084fc' },
  { id: 'sell',      label: 'Sell/Convert',      color: 'var(--gold)' },
]

const HOOK_TYPES = [
  'Curiosity Gap', 'Bold Claim', 'Number/List',
  'POV/Relatability', 'Direct Call-Out', 'Result/Transformation', 'Fear/Urgency',
]

const CTA_GOALS = ['Grow followers', 'Drive engagement', 'Generate leads', 'Save/share viral']

export function ScriptGenerator({ profile }: Props) {
  const [structure, setStructure]   = useState('tutorial')
  const [pillar, setPillar]         = useState('educate')
  const [hookType, setHookType]     = useState('Curiosity Gap')
  const [ctaGoal, setCtaGoal]       = useState('Generate leads')
  const [topic, setTopic]           = useState('')
  const [output, setOutput]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [copied, setCopied]         = useState(false)
  const [mode, setMode]             = useState<'script' | 'hooks' | 'caption'>('script')

  const generate = async () => {
    if (!topic) return
    setLoading(true)
    setOutput('')

    const sys = `You are an expert short-form video strategist trained on the Personal Brand Launch methodology by Ava Yuergens. Write in spoken English — short sentences, second person, conversational.`

    let prompt = ''
    if (mode === 'script') {
      prompt = `${sys}

Creator: ${profile.name}
Niche: ${profile.niche}
Audience: ${profile.audience}
Offer: ${profile.offer} (${profile.pricePoint})
Platform: ${profile.platform}

Generate a complete short-form video script using the ${structure} structure for: "${topic}"
Content pillar: ${pillar} | Hook type: ${hookType} | CTA goal: ${ctaGoal}

Format exactly:
HOOK (first 3 seconds):
[hook]

BODY:
[body]

CTA:
[cta]

ESTIMATED DURATION: [X seconds]
NOTES: [2-3 filming tips]`
    } else if (mode === 'hooks') {
      prompt = `${sys}

Creator: ${profile.name} | Niche: ${profile.niche} | Audience: ${profile.audience}

Generate 10 scroll-stopping hooks for: "${topic}"
Mix archetypes: Curiosity Gap, Bold Claim, Number/List, POV, Direct Call-Out.
Numbered list, 1-3 short sentences each. Platform: ${profile.platform}.`
    } else {
      prompt = `${sys}

Creator: ${profile.name} | Niche: ${profile.niche} | Offer: ${profile.offer}

Write an Instagram caption for a ${pillar} post on: "${topic}"
- First line = hook
- 3-5 value sentences
- CTA: ${ctaGoal}
- 3-5 niche hashtags`
    }

    try {
      await streamText(prompt, (chunk) => {
        setOutput(prev => prev + chunk)
      }, 'claude-sonnet')
    } catch {
      setOutput('Error generating. Check your Claude API key in ⚙ API Keys.')
    }
    setLoading(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="page-title">Script Generator</div>
      <div className="page-sub">AI-powered content creation using Ava's proven frameworks</div>

      <div className="gen-layout">
        {/* Controls */}
        <div className="gen-controls">
          <div style={{ marginBottom: 20 }}>
            <div className="form-label">Generate</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['script', 'hooks', 'caption'] as const).map(m => (
                <button key={m} className={`chip ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)} style={{ fontSize: 12, padding: '6px 12px' }}>
                  {m === 'script' ? '🎬 Script' : m === 'hooks' ? '🎣 Hooks' : '✍️ Caption'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Topic / Angle</label>
            <input className="form-input" placeholder={`e.g. ${profile.niche} mistake most people make`}
              value={topic} onChange={e => setTopic(e.target.value)} />
          </div>

          {mode === 'script' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div className="form-label">Script Structure</div>
                {STRUCTURES.map(s => (
                  <button key={s.id} className={`chip ${structure === s.id ? 'active' : ''}`}
                    onClick={() => setStructure(s.id)}
                    style={{ marginBottom: 8, marginRight: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="form-label">Content Pillar</div>
                <div className="chip-group">
                  {PILLARS.map(p => (
                    <button key={p.id} className={`chip ${pillar === p.id ? 'active' : ''}`}
                      onClick={() => setPillar(p.id)}>{p.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="form-label">Hook Archetype</div>
                <div className="chip-group">
                  {HOOK_TYPES.map(h => (
                    <button key={h} className={`chip ${hookType === h ? 'active' : ''}`}
                      onClick={() => setHookType(h)} style={{ fontSize: 12 }}>{h}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="form-label">CTA Goal</div>
                <div className="chip-group">
                  {CTA_GOALS.map(c => (
                    <button key={c} className={`chip ${ctaGoal === c ? 'active' : ''}`}
                      onClick={() => setCtaGoal(c)} style={{ fontSize: 12 }}>{c}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button className="btn-primary" onClick={generate} disabled={!topic || loading}>
            {loading ? 'Generating…'
              : mode === 'hooks' ? '✦ Generate 10 Hooks'
              : mode === 'caption' ? '✦ Write Caption'
              : '✦ Generate Script'}
          </button>
        </div>

        {/* Output */}
        <div className="gen-output">
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Output
          </div>
          <div className="output-area">
            {!output && !loading && (
              <div className="output-placeholder">
                <div className="output-placeholder-icon">✦</div>
                <div style={{ fontSize: 15, fontFamily: 'Syne', fontWeight: 700 }}>Ready to create</div>
                <div style={{ fontSize: 13, maxWidth: 280 }}>Fill in the controls and hit Generate.</div>
              </div>
            )}
            {loading && !output && (
              <div className="loading-pulse">
                <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
                <span style={{ fontSize: 13, color: 'var(--text-dim)', marginLeft: 8 }}>Crafting your content…</span>
              </div>
            )}
            {output && <div style={{ fontFamily: 'DM Sans', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{output}</div>}
          </div>
          {output && (
            <div className="output-actions">
              <button className="copy-btn" onClick={copy}>{copied ? '✓ Copied!' : '⧉ Copy'}</button>
              <button className="copy-btn" onClick={() => { setOutput(''); setTopic('') }}>↺ Reset</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
