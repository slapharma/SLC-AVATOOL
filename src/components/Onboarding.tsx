import { useState } from 'react'
import type { CreatorProfile } from '../App'

type Props = { onComplete: (p: CreatorProfile) => void }

const STEPS = ['About You', 'Your Audience', 'Your Offer', 'Your Goals']

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<CreatorProfile>({
    name: '', niche: '', audience: '', offer: '',
    pricePoint: '', platform: 'Instagram', goal: '', currentFollowers: '0'
  })

  const set = (k: keyof CreatorProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const canNext = () => {
    if (step === 0) return form.name && form.niche
    if (step === 1) return form.audience
    if (step === 2) return form.offer && form.pricePoint
    return form.goal
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else onComplete(form)
  }

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-bg" />
      <div className="onboarding-card">
        <div className="onboarding-badge">Social Revenue Engine</div>
        <h1 className="onboarding-title">
          {step === 0 && <>Build your brand.<br /><span>Print money.</span></>}
          {step === 1 && <>Who are you <span>talking to?</span></>}
          {step === 2 && <>What are you <span>selling?</span></>}
          {step === 3 && <>Let's set your <span>targets.</span></>}
        </h1>
        <p className="onboarding-sub">
          {step === 0 && "Your personalised AI growth engine, built on Ava's proven methodology that grew accounts from 0 to 100K+ and built million-dollar businesses through organic social."}
          {step === 1 && "The more specific your audience, the sharper your content and the faster you grow. Vague audiences get vague results."}
          {step === 2 && "Every piece of content should ultimately serve your offer. We'll build your entire strategy around converting strangers to buyers."}
          {step === 3 && "Set a clear follower goal and revenue target so the engine can prioritise the right moves at the right time."}
        </p>

        <div className="step-indicator">
          {STEPS.map((_, i) => (
            <div key={i} className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="form-group">
              <label className="form-label">Your name / brand name</label>
              <input className="form-input" placeholder="e.g. Clifton Ward" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Your niche</label>
              <input className="form-input" placeholder="e.g. Pharma licensing & B2B strategy" value={form.niche} onChange={set('niche')} />
            </div>
            <div className="form-group">
              <label className="form-label">Primary platform</label>
              <select className="form-select" value={form.platform} onChange={set('platform')}>
                <option>Instagram</option>
                <option>TikTok</option>
                <option>LinkedIn</option>
                <option>YouTube</option>
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Who is your ideal customer?</label>
              <input className="form-input" placeholder="e.g. Pharma founders & biotech CEOs looking for EU licensing partners" value={form.audience} onChange={set('audience')} />
            </div>
            <div className="form-group">
              <label className="form-label">Current follower count</label>
              <input className="form-input" type="number" placeholder="e.g. 2400" value={form.currentFollowers} onChange={set('currentFollowers')} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label className="form-label">Core offer / product</label>
              <input className="form-input" placeholder="e.g. Pharma licensing consulting retainer" value={form.offer} onChange={set('offer')} />
            </div>
            <div className="form-group">
              <label className="form-label">Price point</label>
              <select className="form-select" value={form.pricePoint} onChange={set('pricePoint')}>
                <option value="">Select range</option>
                <option value="free">Free / Lead magnet</option>
                <option value="low">Low ticket ($1–$500)</option>
                <option value="mid">Mid ticket ($500–$5,000)</option>
                <option value="high">High ticket ($5,000–$25,000)</option>
                <option value="enterprise">Enterprise ($25,000+)</option>
              </select>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="form-group">
              <label className="form-label">Follower goal (6 months)</label>
              <input className="form-input" placeholder="e.g. 50,000" value={form.goal} onChange={set('goal')} />
            </div>
          </>
        )}

        <button className="btn-primary" onClick={next} disabled={!canNext()}>
          {step < STEPS.length - 1 ? 'Continue →' : 'Launch My Engine →'}
        </button>
      </div>
    </div>
  )
}
