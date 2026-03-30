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

export type AppView = 'dashboard' | 'scripts' | 'calendar' | 'funnel' | 'images' | 'video'

function App() {
  const [profile, setProfile]       = useState<CreatorProfile | null>(null)
  const [view, setView]             = useState<AppView>('dashboard')
  const [showKeys, setShowKeys]     = useState(false)
  const [showSetup, setShowSetup]   = useState(false)

  const handleProfileComplete = (p: CreatorProfile) => {
    setProfile(p)
    setShowSetup(false)
    setShowKeys(true)
  }

  return (
    <div className="app-shell">
      {/* Profile setup modal overlay */}
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
        view={view} setView={setView}
        profile={profile}
        onReset={() => setShowSetup(true)}
        onKeys={() => setShowKeys(true)}
      />
      <main className="main-content">
        {view === 'dashboard' && <Dashboard profile={profile} setView={setView} onSetup={() => setShowSetup(true)} />}
        {view === 'scripts'   && profile && <ScriptGenerator profile={profile} />}
        {view === 'calendar'  && profile && <ContentCalendar profile={profile} />}
        {view === 'funnel'    && profile && <FunnelBuilder profile={profile} />}
        {view === 'images'    && profile && <ImageGenerator profile={profile} />}
        {view === 'video'     && profile && <VideoGenerator profile={profile} />}
        {!profile && view !== 'dashboard' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Setup your creator profile first</div>
            <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => setShowSetup(true)}>Get Started</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
