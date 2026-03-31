import { useState } from 'react'
import type { AppView, CreatorProfile } from '../App'
import { useAuth } from '../context/AuthContext'

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
  { id: 'campaigns' as AppView, icon: '⊞', label: 'Campaigns' },
]

export function Sidebar({ view, setView, profile, onEditProfile, onKeys }: Props) {
  const [open, setOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()

  const navigate = (id: AppView) => {
    setView(id)
    setOpen(false)
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <div className="sidebar-logo" style={{ margin: 0 }}>AVATOOL</div>
        <button className="mobile-menu-btn" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <nav className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">AVATOOL</div>
        <div className="sidebar-tagline">Ava's Methodology</div>

        <div className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {isAdmin && (
            <button
              className={`nav-item ${view === 'admin' ? 'active' : ''}`}
              onClick={() => navigate('admin' as AppView)}
              style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}
            >
              <span className="nav-icon">⚬</span>
              User Management
            </button>
          )}
        </div>

        <div className="sidebar-profile">
          {profile ? (
            <>
              <div className="profile-niche">{profile.niche}</div>
              <div className="profile-name">{profile.name}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="reset-btn" onClick={onKeys}>⚙ API Keys</button>
                <button className="reset-btn" onClick={() => { onEditProfile(); setOpen(false) }}>Edit profile</button>
              </div>
            </>
          ) : (
            <button className="reset-btn" onClick={() => { onEditProfile(); setOpen(false) }} style={{ fontWeight: 600, color: 'var(--gold)' }}>
              + Setup Profile
            </button>
          )}
          {/* Signed-in user + sign out */}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, wordBreak: 'break-all' }}>
              {user?.email}
            </div>
            <button
              className="reset-btn"
              onClick={signOut}
              style={{ color: 'var(--text-dim)', fontSize: 11 }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
