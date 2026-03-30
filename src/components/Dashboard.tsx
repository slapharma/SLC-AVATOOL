import type { CreatorProfile, AppView } from '../App'

type Props = { profile: CreatorProfile | null; setView: (v: AppView) => void; onSetup: () => void }

const priceMap: Record<string, string> = {
  free: 'Lead gen', low: 'Low ticket', mid: 'Mid ticket',
  high: 'High ticket', enterprise: 'Enterprise'
}

const QUICK_ACTIONS = [
  { id: 'scripts' as AppView, icon: '✦', title: 'Generate a Script', desc: 'Create a viral reel script in seconds — hook, body, and CTA included.' },
  { id: 'calendar' as AppView, icon: '▦', title: 'Build Content Calendar', desc: 'Get a full month of strategic content mapped to your niche and offer.' },
  { id: 'funnel' as AppView, icon: '◭', title: 'Build Revenue Funnel', desc: 'Map your full journey from cold scroll to paying client with AI tactics.' },
  { id: 'scripts' as AppView, icon: '◉', title: 'Write Hook Variations', desc: 'Generate 10 scroll-stopping hooks for your next piece of content.' },
]

const GROWTH_PHASES = [
  { label: 'Phase 1', name: 'Foundation', followers: '0–1K', focus: 'Post daily. Establish your content pillars. Build 5–10 cornerstone reels that define your niche authority.', status: 'current' },
  { label: 'Phase 2', name: 'Momentum', followers: '1K–10K', focus: 'Add social proof content. Begin soft selling via Stories. Test 3 CTAs to find your highest-converting ask.', status: 'upcoming' },
  { label: 'Phase 3', name: 'Acceleration', followers: '10K–50K', focus: 'Activate DM automation. Run a lead magnet campaign. Layer in paid ads to amplify organic winners.', status: 'upcoming' },
  { label: 'Phase 4', name: 'Scale', followers: '50K+', focus: 'Build email list from social. Introduce evergreen funnels. Hire to manage posting while you focus on offers.', status: 'upcoming' },
]

export function Dashboard({ profile, setView, onSetup }: Props) {
  if (!profile) {
    return (
      <div>
        <div className="page-title">Welcome to AVATOOL</div>
        <div className="page-sub">Ava's complete content and revenue methodology — in one tool.</div>

        {/* CTA banner */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '40px 36px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Set up your creator profile</div>
            <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 460 }}>
              Tell AVATOOL about your niche, audience, and offer. Takes 2 minutes — unlocks your personalised growth roadmap, script engine, and revenue funnel.
            </div>
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '14px 32px', flexShrink: 0 }} onClick={onSetup}>
            Get Started
          </button>
        </div>

        {/* Feature grid — static preview */}
        <div className="section-title">What's inside</div>
        <div className="cards-grid">
          {QUICK_ACTIONS.map((a, i) => (
            <div key={i} className="action-card" style={{ opacity: 0.5, cursor: 'default' }}>
              <div className="action-icon">{a.icon}</div>
              <div>
                <div className="action-title">{a.title}</div>
                <div className="action-desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules preview */}
        <div className="section-title">Ava's Non-Negotiable Rules</div>
        <div className="strategy-box">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Short-form only', 'Reels ≤60s in 9:16 format. Every platform, every time.'],
              ['Hook in 3 words', 'If the first 3 words don\'t stop the scroll, nothing else matters.'],
              ['One CTA per video', 'Never split the audience\'s attention. One ask, one action.'],
              ['70/30 rule', '70% Educate + Entertain. 30% Sell. Flip it in Stories.'],
              ['Social proof loop', 'Every client win → document → post → attract more clients.'],
              ['Instagram first', 'Best organic growth + sales platform for business owners right now.'],
            ].map(([title, desc], i) => (
              <div key={i} style={{ background: 'var(--surface-2)', padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const followers = parseInt(profile.currentFollowers) || 0
  const goalNum = parseInt(profile.goal.replace(/,/g, '')) || 50000
  const pct = Math.min(100, Math.round((followers / goalNum) * 100))
  const currentPhase = followers < 1000 ? 0 : followers < 10000 ? 1 : followers < 50000 ? 2 : 3

  return (
    <div>
      <div className="page-title">Welcome back, {profile.name.split(' ')[0]}.</div>
      <div className="page-sub">Here's your personalised growth roadmap for <strong style={{ color: 'var(--gold)' }}>{profile.niche}</strong></div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Followers</div>
          <div className="stat-value">{followers.toLocaleString()}</div>
          <div className="stat-sub">of {profile.goal} goal</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Goal Progress</div>
          <div className="stat-value">{pct}%</div>
          <div className="stat-sub" style={{ marginTop: 8 }}>
            <div style={{ background: 'var(--surface-3)', borderRadius: 4, height: 4 }}>
              <div style={{ background: 'var(--gold)', width: `${pct}%`, height: '100%', borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Offer Type</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{priceMap[profile.pricePoint] || '—'}</div>
          <div className="stat-sub">{profile.offer.slice(0, 28)}{profile.offer.length > 28 ? '…' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Growth Phase</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{GROWTH_PHASES[currentPhase].name}</div>
          <div className="stat-sub">{GROWTH_PHASES[currentPhase].followers} followers</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-title">Quick Actions</div>
      <div className="cards-grid">
        {QUICK_ACTIONS.map((a, i) => (
          <div key={i} className="action-card" onClick={() => setView(a.id)}>
            <div className="action-icon">{a.icon}</div>
            <div>
              <div className="action-title">{a.title}</div>
              <div className="action-desc">{a.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Growth Phases */}
      <div className="section-title">Your Growth Roadmap</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
        {GROWTH_PHASES.map((phase, i) => (
          <div key={i} className="strategy-box" style={{
            opacity: i < currentPhase ? 0.5 : 1,
            borderColor: i === currentPhase ? 'var(--gold)' : 'var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                background: i === currentPhase ? 'var(--gold)' : 'var(--surface-3)',
                color: i === currentPhase ? 'var(--ink)' : 'var(--text-dim)',
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                letterSpacing: 1, textTransform: 'uppercase'
              }}>
                {i === currentPhase ? '▶ Current' : phase.label}
              </span>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                {phase.name} — {phase.followers}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>{phase.focus}</div>
          </div>
        ))}
      </div>

      {/* Ava's Core Rules */}
      <div className="section-title">Ava's Non-Negotiable Rules</div>
      <div className="strategy-box">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Short-form only', 'Reels ≤60s in 9:16 format. Every platform, every time.'],
            ['Hook in 3 words', 'If the first 3 words don\'t stop the scroll, nothing else matters.'],
            ['One CTA per video', 'Never split the audience\'s attention. One ask, one action.'],
            ['70/30 rule', '70% Educate + Entertain. 30% Sell. Flip it in Stories.'],
            ['Social proof loop', 'Every client win → document → post → attract more clients.'],
            ['Instagram first', 'Best organic growth + sales platform for business owners right now.'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
