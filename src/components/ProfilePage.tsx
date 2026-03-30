import { useState } from 'react'
import type { CreatorProfile } from '../App'
import type { StoredProfile } from '../lib/profiles'
import { makeProfile } from '../lib/profiles'

type Props = {
  profiles: StoredProfile[]
  activeId: string
  onSave: (profiles: StoredProfile[], activeId: string) => void
  onBack: () => void
}

const BLANK: CreatorProfile = {
  name: '', niche: '', audience: '', offer: '',
  pricePoint: '', platform: 'Instagram', goal: '', currentFollowers: '0',
}

const PLATFORMS = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube']
const PRICE_OPTS = [
  { value: 'free',       label: 'Free / Lead magnet' },
  { value: 'low',        label: 'Low ticket ($1–$500)' },
  { value: 'mid',        label: 'Mid ticket ($500–$5,000)' },
  { value: 'high',       label: 'High ticket ($5,000–$25,000)' },
  { value: 'enterprise', label: 'Enterprise ($25,000+)' },
]

export function ProfilePage({ profiles, activeId, onSave, onBack }: Props) {
  const initial = profiles.find(p => p.id === activeId) || profiles[0] || null
  const [editing, setEditing]   = useState<StoredProfile | null>(initial)
  const [creating, setCreating] = useState(false)
  const [newForm, setNewForm]   = useState<CreatorProfile>({ ...BLANK })
  const [saved, setSaved]       = useState(false)

  const setF  = (k: keyof CreatorProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditing(prev => prev ? { ...prev, [k]: e.target.value } : null)

  const setNF = (k: keyof CreatorProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewForm(f => ({ ...f, [k]: e.target.value }))

  const saveEdit = () => {
    if (!editing) return
    const updated = profiles.map(p => p.id === editing.id ? editing : p)
    onSave(updated, activeId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const saveNew = () => {
    if (!newForm.name || !newForm.niche) return
    const np = makeProfile(newForm)
    const updated = [...profiles, np]
    onSave(updated, np.id)
    setCreating(false)
    setEditing(np)
    setNewForm({ ...BLANK })
  }

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) return
    const updated = profiles.filter(p => p.id !== id)
    const newActive = id === activeId ? updated[0].id : activeId
    onSave(updated, newActive)
    if (editing?.id === id) setEditing(updated.find(p => p.id === newActive) || updated[0])
  }

  const setActive = (id: string) => {
    onSave(profiles, id)
    const p = profiles.find(pr => pr.id === id)
    if (p) setEditing(p)
  }

  const renderFields = (
    vals: CreatorProfile,
    onChange: (k: keyof CreatorProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  ) => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Name / Brand</label>
          <input className="form-input" value={vals.name} onChange={onChange('name')} placeholder="e.g. Clifton Ward" />
        </div>
        <div className="form-group">
          <label className="form-label">Niche</label>
          <input className="form-input" value={vals.niche} onChange={onChange('niche')} placeholder="e.g. Pharma licensing & B2B strategy" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Ideal Customer</label>
        <input className="form-input" value={vals.audience} onChange={onChange('audience')} placeholder="e.g. Pharma founders & biotech CEOs looking for EU licensing partners" />
      </div>
      <div className="form-group">
        <label className="form-label">Core Offer</label>
        <input className="form-input" value={vals.offer} onChange={onChange('offer')} placeholder="e.g. Pharma licensing consulting retainer" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Price Point</label>
          <select className="form-select" value={vals.pricePoint} onChange={onChange('pricePoint')}>
            <option value="">Select range</option>
            {PRICE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Primary Platform</label>
          <select className="form-select" value={vals.platform} onChange={onChange('platform')}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Current Followers</label>
          <input className="form-input" type="number" value={vals.currentFollowers} onChange={onChange('currentFollowers')} />
        </div>
        <div className="form-group">
          <label className="form-label">Follower Goal (6 months)</label>
          <input className="form-input" value={vals.goal} onChange={onChange('goal')} placeholder="e.g. 50,000" />
        </div>
      </div>
    </>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back
        </button>
        <div>
          <div className="page-title" style={{ marginBottom: 0 }}>Creator Profiles</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>Manage profiles — one per brand, niche, or campaign</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Profile list sidebar */}
        <div>
          <div className="section-title">Profiles</div>
          {profiles.map(p => (
            <div key={p.id}
              onClick={() => { setEditing(p); setCreating(false) }}
              style={{
                padding: '10px 14px', marginBottom: 4, cursor: 'pointer', transition: 'all 0.12s',
                background: !creating && editing?.id === p.id ? 'var(--gold-dim)' : 'var(--surface)',
                border: `1px solid ${!creating && editing?.id === p.id ? 'var(--gold)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: !creating && editing?.id === p.id ? 'var(--gold)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {p.name}
                  {p.id === activeId && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', background: 'var(--gold-dim)', padding: '1px 5px', border: '1px solid var(--border)' }}>
                      Active
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.niche}</div>
              </div>
              {profiles.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); deleteProfile(p.id) }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 13, padding: '2px 4px', flexShrink: 0, lineHeight: 1 }}
                  title="Delete profile"
                >✕</button>
              )}
            </div>
          ))}

          <button className="btn-secondary"
            onClick={() => { setCreating(true); setEditing(null) }}
            style={{ width: '100%', marginTop: 8, fontSize: 12, textAlign: 'center' }}>
            + New Profile
          </button>
        </div>

        {/* Edit / Create form */}
        <div className="gen-controls" style={{ height: 'auto' }}>

          {creating && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>New Profile</div>
                <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setCreating(false)}>Cancel</button>
              </div>
              {renderFields(newForm, setNF)}
              <button className="btn-primary" onClick={saveNew} disabled={!newForm.name || !newForm.niche}>
                Create Profile
              </button>
            </>
          )}

          {!creating && editing && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Edit Profile</div>
                {editing.id !== activeId && (
                  <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setActive(editing.id)}>
                    Set as Active
                  </button>
                )}
              </div>
              {renderFields(editing, setF)}
              <button className="btn-primary" onClick={saveEdit}>
                {saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </>
          )}

          {!creating && !editing && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-dim)', fontSize: 14 }}>
              Select a profile to edit, or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
