import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getApiKeys } from './lib/ai'
import { DataProvider, useData } from './context/DataContext'
import { LoginPage } from './components/LoginPage'
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
import { CampaignsPage } from './components/CampaignsPage'
import { AdminPage } from './components/AdminPage'

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

export type StoredProfile = CreatorProfile & { id: string }
export type AppView = 'dashboard' | 'scripts' | 'calendar' | 'funnel' | 'images' | 'video' | 'profile' | 'campaigns' | 'admin'

// Inner shell — rendered only when user is authenticated
function AppShell() {
  const { isAdmin } = useAuth()
  const {
    profiles, activeId, activeProfile, loadingProfiles,
    createProfile, updateProfile, deleteProfile, switchProfile,
    campaigns, saveCampaign, deleteCampaign,
  } = useData()

  const [view, setView]           = useState<AppView>('dashboard')
  const [showKeys, setShowKeys]   = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  // Auto-prompt for API keys on first login to this browser
  useEffect(() => {
    const { claude, openrouter } = getApiKeys()
    if (!claude && !openrouter) setShowKeys(true)
  }, [])

  const handleProfileComplete = async (p: CreatorProfile) => {
    await createProfile(p)
    setShowSetup(false)
    setShowKeys(true)
  }

  const generatorProps = {
    profiles,
    activeProfileId: activeId,
    onProfileSwitch: switchProfile,
    saveCampaign,
    onOpenKeys: () => setShowKeys(true),
  }

  if (loadingProfiles) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-dim)', fontFamily: 'Syne', fontSize: 16 }}>
        Loading…
      </div>
    )
  }

  return (
    <div className="app-shell">
      {/* Onboarding modal */}
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
        profile={activeProfile}
        onEditProfile={() => setView('profile')}
        onKeys={() => setShowKeys(true)}
      />

      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard profile={activeProfile} setView={setView} onSetup={() => setShowSetup(true)} />
        )}
        {view === 'profile' && (
          <ProfilePage
            profiles={profiles}
            activeId={activeId}
            onSwitchProfile={switchProfile}
            onCreateProfile={createProfile}
            onUpdateProfile={updateProfile}
            onDeleteProfile={deleteProfile}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'scripts' && activeProfile && (
          <ScriptGenerator profile={activeProfile} {...generatorProps} />
        )}
        {view === 'calendar' && activeProfile && (
          <ContentCalendar profile={activeProfile} {...generatorProps} />
        )}
        {view === 'funnel' && activeProfile && (
          <FunnelBuilder profile={activeProfile} {...generatorProps} />
        )}
        {view === 'images' && activeProfile && (
          <ImageGenerator profile={activeProfile} {...generatorProps} />
        )}
        {view === 'video' && activeProfile && (
          <VideoGenerator profile={activeProfile} {...generatorProps} />
        )}
        {view === 'campaigns' && (
          <CampaignsPage profiles={profiles} campaigns={campaigns} onDeleteCampaign={deleteCampaign} />
        )}
        {view === 'admin' && isAdmin && (
          <AdminPage />
        )}
        {!activeProfile && view !== 'dashboard' && view !== 'profile' && view !== 'campaigns' && view !== 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Set up your creator profile first</div>
            <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => setShowSetup(true)}>Get Started</button>
          </div>
        )}
      </main>
    </div>
  )
}

// Auth gate — shows login or the app
function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-dim)', fontFamily: 'Syne', fontSize: 16 }}>
        Loading…
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App
