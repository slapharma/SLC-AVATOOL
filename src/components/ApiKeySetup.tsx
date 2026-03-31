import { useState } from 'react'
import { saveApiKey, getApiKeys } from '../lib/ai'

const PROXY = 'https://doncwyumuygrryykanqb.supabase.co/functions/v1/claude-proxy'

type Props = { onClose: () => void }

export function ApiKeySetup({ onClose }: Props) {
  const current = getApiKeys()
  const [c, setC] = useState(current.claude)
  const [o, setO] = useState(current.openrouter)
  const [f, setF] = useState(current.fal)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const save = () => {
    saveApiKey('sre_claude_key', c.trim())
    saveApiKey('sre_or_key', o.trim())
    saveApiKey('sre_fal_key', f.trim())
    onClose()
  }

  const test = async () => {
    setTesting(true)
    setTestResult(null)
    const key = c.trim()
    if (!key) {
      setTestResult({ ok: false, msg: 'Enter your Claude API key first.' })
      setTesting(false)
      return
    }
    try {
      const res = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          stream: false,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say: ok' }],
        }),
      })
      if (res.ok) {
        setTestResult({ ok: true, msg: 'Claude API key is valid.' })
      } else {
        const err = await res.json().catch(() => ({}))
        setTestResult({ ok: false, msg: (err as { error?: string }).error || `Error ${res.status}` })
      }
    } catch {
      setTestResult({ ok: false, msg: 'Network error — check your connection.' })
    }
    setTesting(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        padding: 40, maxWidth: 520, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          API Keys
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 28, lineHeight: 1.6 }}>
          Keys are stored in your browser only — never sent anywhere except the respective API.
        </div>

        {/* Claude key + test */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Claude API Key <span style={{ color: 'var(--gold)' }}>*</span>
            </label>
            <span style={{ fontSize: 11, color: 'var(--gold)' }}>$3/$15 per M tokens (Sonnet 4.6)</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              type="password"
              placeholder="sk-ant-api03-..."
              value={c}
              onChange={e => { setC(e.target.value); setTestResult(null) }}
              style={{ flex: 1 }}
            />
            <button
              className="btn-secondary"
              onClick={test}
              disabled={testing}
              style={{ padding: '0 14px', fontSize: 12, flexShrink: 0 }}
            >
              {testing ? '…' : 'Test'}
            </button>
          </div>
          {testResult && (
            <div style={{
              marginTop: 8, padding: '8px 12px', fontSize: 12,
              background: testResult.ok ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${testResult.ok ? '#86efac' : '#fecaca'}`,
              color: testResult.ok ? '#166534' : '#b91c1c',
            }}>
              {testResult.ok ? '✓ ' : '✗ '}{testResult.msg}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
            platform.claude.ai → API Keys. Used for scripts, strategy, funnels.
          </div>
        </div>

        {/* OpenRouter key */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              OpenRouter API Key <span style={{ color: 'var(--gold)' }}>*</span>
            </label>
            <span style={{ fontSize: 11, color: 'var(--gold)' }}>Pay-per-image via OpenRouter credits</span>
          </div>
          <input
            className="form-input"
            type="password"
            placeholder="sk-or-v1-..."
            value={o}
            onChange={e => setO(e.target.value)}
          />
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
            openrouter.ai → Keys. Used for images ($0.003–$0.15/img) + free text models.
          </div>
        </div>

        {/* FAL key */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              FAL.ai API Key <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>(optional)</span>
            </label>
            <span style={{ fontSize: 11, color: 'var(--gold)' }}>$0.029/sec · 5s ≈ $0.15</span>
          </div>
          <input
            className="form-input"
            type="password"
            placeholder="fal-..."
            value={f}
            onChange={e => setF(e.target.value)}
          />
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
            fal.ai → Dashboard → Keys. Used for video generation only (Kling 3.0).
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', padding: 14, marginBottom: 20, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--green)' }}>Free tier tip:</strong> OpenRouter offers free text models (DeepSeek V3, Llama 3.3 70B). Your Claude key is used for final scripts and strategy only.
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={save} style={{ flex: 1 }}>Save Keys</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
