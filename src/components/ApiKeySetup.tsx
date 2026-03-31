import { useState } from 'react'
import { saveApiKey, getApiKeys } from '../lib/ai'

type Props = {
  onClose: () => void
}

export function ApiKeySetup({ onClose }: Props) {
  const current = getApiKeys()
  const [c, setC] = useState(current.claude)
  const [o, setO] = useState(current.openrouter)
  const [f, setF] = useState(current.fal)

  const save = () => {
    saveApiKey('sre_claude_key', c.trim())
    saveApiKey('sre_or_key', o.trim())
    saveApiKey('sre_fal_key', f.trim())
    onClose()
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
          Keys are stored locally in your browser, scoped to your account. Never sent anywhere except directly to the respective API.
        </div>

        {[
          {
            label: 'Claude API Key', value: c, set: setC, required: true,
            hint: 'platform.claude.ai → API Keys. Used for scripts, strategy, funnels.',
            placeholder: 'sk-ant-api03-...',
            cost: '$3/$15 per M tokens (Sonnet 4.6)'
          },
          {
            label: 'OpenRouter API Key', value: o, set: setO, required: true,
            hint: 'openrouter.ai → Keys. Used for images ($0.003–$0.15/img) + free text models.',
            placeholder: 'sk-or-v1-...',
            cost: 'Pay-per-image via OpenRouter credits'
          },
          {
            label: 'FAL.ai API Key', value: f, set: setF, required: false,
            hint: 'fal.ai → Dashboard → Keys. Used for video generation only (Kling 3.0).',
            placeholder: 'fal-...',
            cost: '$0.029/sec · 5s clip ≈ $0.15'
          },
        ].map(({ label, value, set, required, hint, placeholder, cost }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                {label} {required ? <span style={{ color: 'var(--gold)' }}>*</span> : <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>(optional)</span>}
              </label>
              <span style={{ fontSize: 11, color: 'var(--gold)' }}>{cost}</span>
            </div>
            <input
              className="form-input"
              type="password"
              placeholder={placeholder}
              value={value}
              onChange={e => set(e.target.value)}
            />
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{hint}</div>
          </div>
        ))}

        <div style={{ background: 'var(--surface-2)', padding: 14, marginBottom: 20, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--green)' }}>Free tier tip:</strong> OpenRouter offers 29 free text models (DeepSeek V3, Llama 3.3 70B) — the app uses these automatically for prompt crafting, hook drafts, and caption variations. Your Claude key is reserved for final scripts and strategy.
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={save} style={{ flex: 1 }}>Save Keys</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
