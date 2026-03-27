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
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [view, setView]       = useState<AppView>('dashboard')
  const [showKeys, setShowKeys] = useState(false)

  if (!profile) {
    return <Onboarding onComplete={(p) => { setProfile(p); setShowKeys(true) }} />
  }

  return (
    <div className="app-shell">
      {showKeys && <ApiKeySetup onClose={() => setShowKeys(false)} />}
      <Sidebar
        view={view} setView={setView}
        profile={profile}
        onReset={() => setProfile(null)}
        onKeys={() => setShowKeys(true)}
      />
      <main className="main-content">
        {view === 'dashboard' && <Dashboard profile={profile} setView={setView} />}
        {view === 'scripts'   && <ScriptGenerator profile={profile} />}
        {view === 'calendar'  && <ContentCalendar profile={profile} />}
        {view === 'funnel'    && <FunnelBuilder profile={profile} />}
        {view === 'images'    && <ImageGenerator profile={profile} />}
        {view === 'video'     && <VideoGenerator profile={profile} />}
      </main>
    </div>
  )
}

export default App
