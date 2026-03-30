import type { AppView, CreatorProfile } from '../App'

type Props = {
  view: AppView
  setView: (v: AppView) => void
  profile: CreatorProfile | null
  onEditProfile: () => void
  onKeys: () => void
}

const navItems = [
  { id: 'dashboard' as AppView, icon: '◈', label: 'Strategy Hub' },
  { id: 'scripts'   as AppView, icon: '✦', label: 'Script Generator' },
  { id: 'images'    as AppView, icon: '◉', label: 'Image Generator' },
  { id: 'video'     as AppView, icon: '▶', label: 'Video Generator' },
  { id: 'calendar'  as AppView, icon: '▦', label: 'Content Calendar' },
  { id: 'funnel'    as AppView, icon: '◭', label: 'Revenue Funnel' },
]

export function Sidebar({ view, setView, profile, onEditProfile, onKeys }: Props) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">AVATOOL</div>
      <div className="sidebar-tagline">Ava's Methodology</div>

      <div className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? 'active' : ''}`}
            onClick={() => setView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidebar-profile">
        {profile ? (
          <>
            <div className="profile-niche">{profile.niche}</div>
            <div className="profile-name">{profile.name}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="reset-btn" onClick={onKeys}>⚙ API Keys</button>
              <button className="reset-btn" onClick={onEditProfile}>Edit profile</button>
            </div>
          </>
        ) : (
          <button className="reset-btn" onClick={onEditProfile} style={{ fontWeight: 600, color: 'var(--gold)' }}>
            + Setup Profile
          </button>
        )}
      </div>
    </nav>
  )
}
