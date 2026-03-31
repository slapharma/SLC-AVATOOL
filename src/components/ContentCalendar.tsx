import { generateText } from '../lib/ai'
import { useState } from 'react'
import type { CreatorProfile } from '../App'
import type { StoredProfile } from '../lib/profiles'
import type { Campaign } from '../lib/campaigns'
import { InfoTip } from './InfoTip'
import { ProfileSelector } from './ProfileSelector'

type Props = {
  profile: CreatorProfile
  profiles?: StoredProfile[]
  activeProfileId?: string
  onProfileSwitch?: (id: string) => void
  saveCampaign?: (c: Omit<Campaign, 'id' | 'createdAt'>) => Promise<Campaign>
}

type Post = { type: string; title: string; hook: string; cta: string }
type Week = { theme: string; posts: Post[] }
type CalendarData = { weeks: Week[] }

const TYPE_COLORS: Record<string, string> = {
  educate: 'type-educate', relate: 'type-relate', sell: 'type-sell',
  story: 'type-story', proof: 'type-sell', contrarian: 'type-relate'
}

export function ContentCalendar({ profile, profiles = [], activeProfileId = '', onProfileSwitch, saveCampaign }: Props) {
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [postsPerWeek, setPostsPerWeek] = useState(5)
  const [calSaved, setCalSaved] = useState(false)

  const generate = async () => {
    setLoading(true)
    setCalendar(null)
    setSelectedPost(null)

    const prompt = `You are an expert social media content strategist trained on the Personal Brand Launch methodology by Ava Yuergens.

Creator: ${profile.name}
Niche: ${profile.niche}
Audience: ${profile.audience}
Offer: ${profile.offer} (${profile.pricePoint} price point)
Platform: ${profile.platform}
Posts per week: ${postsPerWeek}

Generate a 4-week content calendar. Follow the 70/30 rule (70% educate/entertain, 30% sell).
Week 1: Awareness + Authority. Week 2: Trust + Social Proof. Week 3: Deep Education + Soft Sell. Week 4: Direct Conversion.

Respond ONLY with valid JSON in this exact format (no markdown, no preamble):
{
  "weeks": [
    {
      "theme": "Week 1 theme name",
      "posts": [
        {
          "type": "educate",
          "title": "Short post title",
          "hook": "Opening hook sentence",
          "cta": "Call to action"
        }
      ]
    }
  ]
}

Types allowed: educate, relate, sell, story, proof, contrarian
Generate exactly ${postsPerWeek} posts per week. Make titles specific to the niche, not generic.`

    try {
      const raw = await generateText(prompt, 'claude-sonnet')
      const clean = raw.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)
      setCalendar(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-title">Content Calendar</div>
      <div className="page-sub">A full month of strategic content, mapped to your niche and offer</div>

      <div style={{ maxWidth: 360, marginBottom: 16 }}>
        <ProfileSelector profiles={profiles} activeId={activeProfileId} onSwitch={onProfileSwitch || (() => {})} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            Posts per week:
            <InfoTip text="How many posts to schedule. 3/week is minimum viable for growth. 5/week is Ava's recommended baseline. 7/week is aggressive growth mode — only sustainable with a content system in place." />
          </span>
          {[3, 4, 5, 7].map(n => (
            <button key={n} className={`chip ${postsPerWeek === n ? 'active' : ''}`}
              onClick={() => setPostsPerWeek(n)} style={{ fontSize: 13, padding: '6px 14px' }}>
              {n}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}
          style={{ width: 'auto', padding: '12px 28px' }}>
          {loading ? 'Building calendar…' : '▦ Generate Month Plan'}
        </button>
        {calendar && (
          <button className="btn-secondary" onClick={async () => {
            const active = profiles.find(p => p.id === activeProfileId)
            await saveCampaign?.({ type: 'calendar', profileId: activeProfileId, profileName: active?.name || profile.name, niche: profile.niche, title: `${postsPerWeek}x/week · ${profile.niche}`, output: JSON.stringify(calendar) })
            setCalSaved(true); setTimeout(() => setCalSaved(false), 2000)
          }} style={{ padding: '12px 20px' }}>
            {calSaved ? '✓ Saved!' : '⊞ Save Calendar'}
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="loading-pulse" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>Building your personalised month plan…</div>
        </div>
      )}

      {calendar && (
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="calendar-grid" style={{ gridTemplateColumns: `repeat(${Math.min(calendar.weeks.length, 4)}, 1fr)` }}>
              {calendar.weeks.map((week, wi) => (
                <div key={wi} className="week-col">
                  <div className="week-header">
                    Week {wi + 1}
                    <div className="week-theme">{week.theme}</div>
                  </div>
                  {week.posts.map((post, pi) => (
                    <div key={pi} className="post-item" onClick={() => setSelectedPost(post)}>
                      <div>
                        <span className={`post-type ${TYPE_COLORS[post.type] || 'type-educate'}`}>{post.type}</span>
                      </div>
                      <div className="post-title">{post.title}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              {[['educate', 'type-educate'], ['relate', 'type-relate'], ['sell', 'type-sell'], ['story', 'type-story']].map(([t, c]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`post-type ${c}`}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Post Detail Panel */}
          {selectedPost && (
            <div style={{ width: 300, flexShrink: 0 }}>
              <div className="strategy-box" style={{ position: 'sticky', top: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span className={`post-type ${TYPE_COLORS[selectedPost.type] || 'type-educate'}`}>{selectedPost.type}</span>
                  <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>
                <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
                  {selectedPost.title}
                </div>
                <div className="tactic-item">
                  <div className="tactic-label">Hook</div>
                  {selectedPost.hook}
                </div>
                <div className="tactic-item">
                  <div className="tactic-label">CTA</div>
                  {selectedPost.cta}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>
                  Click "Script Generator" to write the full script for this post.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!calendar && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>▦</div>
          <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            No calendar yet
          </div>
          <div style={{ fontSize: 14 }}>Hit Generate Month Plan to get a full 4-week content strategy tailored to your niche.</div>
        </div>
      )}
    </div>
  )
}
