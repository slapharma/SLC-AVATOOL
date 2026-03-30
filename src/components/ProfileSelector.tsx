import type { StoredProfile } from '../lib/profiles'

type Props = {
  profiles: StoredProfile[]
  activeId: string
  onSwitch: (id: string) => void
}

/** Always-visible profile selector — place as first child inside gen-controls */
export function ProfileSelector({ profiles, activeId, onSwitch }: Props) {
  const active = profiles.find(p => p.id === activeId)
  return (
    <div style={{ marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
      <div className="form-label" style={{ marginBottom: 7 }}>Active Profile</div>
      <select
        value={activeId}
        onChange={e => onSwitch(e.target.value)}
        className="form-select"
        style={{ fontSize: 13 }}
      >
        {profiles.map(p => (
          <option key={p.id} value={p.id}>{p.name} · {p.niche}</option>
        ))}
        {profiles.length === 0 && <option value="">No profile — set one up first</option>}
      </select>
      {active && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          {active.audience ? `Audience: ${active.audience.slice(0, 60)}${active.audience.length > 60 ? '…' : ''}` : active.platform}
        </div>
      )}
    </div>
  )
}
