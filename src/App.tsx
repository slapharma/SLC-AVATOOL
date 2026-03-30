import { useState } from 'react'
import { Onboarding } from './components/Onboarding'
import { Dashboard } from './components/Dashboard'
import { ScriptGenerator } from './components/ScriptGenerator'
import { ContentCalendar } from './components/ContentCalendar'
import { FunnelBuilder } from './components/FunnelBuilder'
import { ImageGenerator } from './components/ImageGenerator'
import { VideoGenerator } from './components/VideoGenerator'
import { Sidebar } from './components/Sidebar'
import { ApiKeySetup } from './components/ApiKeySetup'
import { ProfilePage } from './components/ProfilePage'
import { loadProfiles, saveProfiles, loadActiveId, saveActiveId, makeProfile } from './lib/profiles'
import type { StoredProfile } from './lib/profiles'

export type CreatorProfile = {
  name: string
  niche: string
  audience: string
  offer: string
  pricePoint: string
  platform: string
  goal: string
  currentFollowers: string
}

export type { StoredProfile }
export type AppView = 'dashboard' | 'scripts' | 'calendar' | 'funnel' | 'images' | 'video' | 'profile'

function App() {
  const [profiles, setProfilesRaw] = useState<StoredProfile[]>(() => loadProfiles())
  const [activeId, setActiveIdRaw] = useState<string>(() => {
    const id  = loadActiveId()
    const all = loadProfiles()
    return all.find(p => p.id === id) ? id : all[0]?.id || ''
  })
  const [view, setView]           = useState<AppView>('dashboard')
  const [showKeys, setShowKeys]   = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  const profile: StoredProfile | null = profiles.find(p => p.id === activeId) || profiles[0] || null

  const persistProfiles = (ps: StoredProfile[], aid: string) => {
    saveProfiles(ps)
    saveActiveId(aid)
    setProfilesRaw(ps)
    setActiveIdRaw(aid)
  }

  const switchProfile = (id: string) => {
    saveActiveId(id)
    setActiveIdRaw(id)
  }

  const handleProfileComplete = (p: CreatorProfile) => {
    const sp = makeProfile(p)
    persistProfiles([...profiles, sp], sp.id)
    setShowSetup(false)
    setShowKeys(true)
  }

  const generatorProps = {
    profiles,
    activeProfileId: activeId,
    onProfileSwitch: switchProfile,
  }

  return (
    <div className="app-shell">
      {/* Onboarding modal overlay */}
      {showSetup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSetup(false)}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, color: 'var(--text-dim)', padding: 4 }}
              aria-label="Close"
            >✕</button>
            <Onboarding onComplete={handleProfileComplete} />
          </div>
        </div>
      )}

      {showKeys && <ApiKeySetup onClose={() => setShowKeys(false)} />}

      <Sidebar
        view={view}
        setView={setView}
        profile={profile}
        onEditProfile={() => setView('profile')}
        onKeys={() => setShowKeys(true)}
      />

      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard profile={profile} setView={setView} onSetup={() => setShowSetup(true)} />
        )}
        {view === 'profile' && (
          <ProfilePage
            profiles={profiles}
            activeId={activeId}
            onSave={persistProfiles}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'scripts' && profile && (
          <ScriptGenerator profile={profile} {...generatorProps} />
        )}
        {view === 'calendar' && profile && (
          <ContentCalendar profile={profile} {...generatorProps} />
        )}
        {view === 'funnel' && profile && (
          <FunnelBuilder profile={profile} {...generatorProps} />
        )}
        {view === 'images' && profile && (
          <ImageGenerator profile={profile} {...generatorProps} />
        )}
        {view === 'video' && profile && (
          <VideoGenerator profile={profile} {...generatorProps} />
        )}
        {!profile && view !== 'dashboard' && view !== 'profile' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Set up your creator profile first</div>
            <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => setShowSetup(true)}>Get Started</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
