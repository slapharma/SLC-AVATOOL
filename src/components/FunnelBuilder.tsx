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
  onOpenKeys?: () => void
}

type FunnelStage = {
  id: string
  label: string
  name: string
  desc: string
  colorClass: string
  badgeColor: string
}

const STAGES: FunnelStage[] = [
  {
    id: 'awareness', label: 'Stage 1', name: 'Awareness',
    desc: 'Cold audience. They scroll past your Reel. You have 3 seconds.',
    colorClass: 'awareness', badgeColor: '#60a5fa'
  },
  {
    id: 'consideration', label: 'Stage 2', name: 'Consideration',
    desc: 'They followed you or visited your profile. Warm, curious, not ready to buy.',
    colorClass: 'consideration', badgeColor: '#c084fc'
  },
  {
    id: 'conversion', label: 'Stage 3', name: 'Conversion',
    desc: 'Hot leads. They DM\'d you, clicked your link, or booked a call.',
    colorClass: 'conversion', badgeColor: '#c8a96e'
  },
  {
    id: 'retention', label: 'Stage 4', name: 'Retention & Referral',
    desc: 'Paying clients. Turn them into social proof and referral engines.',
    colorClass: 'retention', badgeColor: '#4ade80'
  },
]

type StageContent = { organic: string; paid: string; email_dm: string; offer: string }

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

export function FunnelBuilder({ profile, profiles = [], activeProfileId = '', onProfileSwitch, saveCampaign, onOpenKeys }: Props) {
  const [selected, setSelected] = useState<FunnelStage | null>(null)
  const [stageContent, setStageContent] = useState<Record<string, StageContent>>({})
  const [loading, setLoading] = useState(false)

  const loadStage = async (stage: FunnelStage) => {
    setSelected(stage)
    if (stageContent[stage.id]) return
    setLoading(true)

    const prompt = `You are an expert revenue funnel strategist trained on the Personal Brand Launch methodology by Ava Yuergens.

Creator: ${profile.name}
Niche: ${profile.niche}
Audience: ${profile.audience}
Offer: ${profile.offer} (${profile.pricePoint} price point)
Platform: ${profile.platform}

Generate specific tactics for the ${stage.name} stage of their revenue funnel.
This is a ${profile.pricePoint} offer targeting: ${profile.audience}

Respond ONLY with valid JSON (no markdown):
{
  "organic": "3-4 specific organic social tactics for this stage. Be niche-specific, not generic.",
  "paid": "2-3 specific paid ads or retargeting tactics. Include ad type, audience, and objective.",
  "email_dm": "2-3 specific email/DM sequence tactics with example subject lines or opening messages.",
  "offer": "What specific offer or CTA to present at this stage, and how to frame it for this audience."
}`

    try {
      const raw = await callClaude(prompt)
      const clean = raw.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)
      setStageContent(prev => ({ ...prev, [stage.id]: data }))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed'
      if (msg.toLowerCase().includes('key')) onOpenKeys?.()
      setStageContent(prev => ({
        ...prev,
        [stage.id]: {
          organic: `Error: ${msg}`,
          paid: 'Please check your API keys and try again.',
          email_dm: 'Please check your API keys and try again.',
          offer: 'Please check your API keys and try again.'
        }
      }))
    }
    setLoading(false)
  }

  const content = selected ? stageContent[selected.id] : null

  return (
    <div>
      <div className="page-title">Revenue Funnel</div>
      <div className="page-sub">
        Your complete journey from cold scroll to paying client — with organic, paid, and email/DM tactics
        <InfoTip text="Click each funnel stage to get AI-generated tactics specific to your niche and offer. Each stage has different goals: Awareness = stop the scroll. Consideration = build trust. Conversion = make the ask. Retention = turn clients into referral machines." />
      </div>

      <div style={{ maxWidth: 360, marginBottom: 20 }}>
        <ProfileSelector profiles={profiles} activeId={activeProfileId} onSwitch={onProfileSwitch || (() => {})} />
      </div>

      <div className="funnel-layout">
        {/* Stages */}
        <div>
          {/* Funnel visual */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, alignItems: 'center' }}>
            {STAGES.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  flex: 1, background: selected?.id === s.id ? s.badgeColor : 'var(--surface-2)',
                  border: `1px solid ${s.badgeColor}40`,
                  borderRadius: 6, padding: '8px 12px', fontSize: 12, fontWeight: 700,
                  color: selected?.id === s.id ? 'var(--ink)' : s.badgeColor,
                  textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                }} onClick={() => loadStage(s)}>
                  {s.name}
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{ color: 'var(--text-dim)', fontSize: 16, margin: '0 4px' }}>→</div>
                )}
              </div>
            ))}
          </div>

          <div className="funnel-stages">
            {STAGES.map(stage => (
              <div
                key={stage.id}
                className={`funnel-stage ${stage.colorClass} ${selected?.id === stage.id ? 'active' : ''}`}
                onClick={() => loadStage(stage)}
              >
                <div className="stage-label">{stage.label}</div>
                <div className="stage-name">{stage.name}</div>
                <div className="stage-desc">{stage.desc}</div>
                {selected?.id === stage.id && content && (
                  <div style={{ marginTop: 12, fontSize: 11, color: stage.badgeColor, fontWeight: 700 }}>
                    ▼ Details loaded →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="funnel-detail">
          {!selected && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>◭</div>
              <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Select a funnel stage</div>
              <div style={{ fontSize: 13 }}>Click any stage to get AI-generated tactics for organic, paid, email/DM, and offer strategy.</div>
            </div>
          )}

          {selected && loading && (
            <div className="detail-generating">
              <div className="loading-pulse" style={{ justifyContent: 'center' }}>
                <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
              </div>
              <div>Generating {selected.name} tactics…</div>
            </div>
          )}

          {selected && !loading && content && (
            <>
              <div className="detail-stage-badge" style={{ background: `${selected.badgeColor}20`, color: selected.badgeColor }}>
                {selected.name} Stage
              </div>
              <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
                {selected.desc}
              </div>

              {[
                { key: 'organic',  label: '📱 Organic Social',        tip: 'Content and community tactics you can do for free on your primary platform. These build the top of your funnel through reach and engagement.' },
                { key: 'paid',     label: '💰 Paid Ads',              tip: 'Paid amplification tactics to accelerate reach or retarget warm audiences. Most effective once you have proven organic content to boost.' },
                { key: 'email_dm', label: '✉️ Email / DM Sequence',   tip: 'Direct outreach and nurture sequences. DMs work best at Consideration. Email works at Conversion and Retention once you have a list.' },
                { key: 'offer',    label: '🎯 Offer & CTA',           tip: 'The specific ask and framing for this stage. Matching your offer to the prospect\'s readiness level is the single biggest conversion lever.' },
              ].map(({ key, label, tip }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div className="tactic-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {label}
                    <InfoTip text={tip} />
                  </div>
                  <div className="tactic-item" style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7 }}>
                    {content[key as keyof StageContent]}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => { setStageContent(prev => { const n = {...prev}; delete n[selected.id]; return n }); loadStage(selected) }}
                  style={{ flex: 1, fontSize: 13 }}>
                  ↺ Regenerate
                </button>
                <button className="btn-secondary" onClick={async () => {
                  const active = profiles.find(p => p.id === activeProfileId)
                  await saveCampaign?.({ type: 'funnel', profileId: activeProfileId, profileName: active?.name || profile.name, niche: profile.niche, title: `${selected.name} — ${profile.niche}`, output: JSON.stringify(content) })
                }} style={{ flex: 1, fontSize: 13 }}>
                  ⊞ Save Stage
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
