import type { StoredProfile } from '../lib/profiles'

type Props = {
  profiles: StoredProfile[]
  activeId: string
  onSwitch: (id: string) => void
}

export function ProfileSelector({ profiles, activeId, onSwitch }: Props) {
  if (profiles.length <= 1) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
      padding: '8px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0, fontWeight: 600 }}>
        Profile
      </span>
      <select
        value={activeId}
        onChange={e => onSwitch(e.target.value)}
        style={{
          flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: 13, padding: '5px 10px',
          fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer',
        }}
      >
        {profiles.map(p => (
          <option key={p.id} value={p.id}>{p.name} · {p.niche}</option>
        ))}
      </select>
    </div>
  )
}
