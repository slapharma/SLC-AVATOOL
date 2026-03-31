import { useState } from 'react'
import { TYPE_LABELS, TYPE_COLORS } from '../lib/campaigns'
import type { Campaign, CampaignType } from '../lib/campaigns'
import type { StoredProfile } from '../lib/profiles'

type Props = {
  profiles: StoredProfile[]
  campaigns: Campaign[]
  onDeleteCampaign: (id: string) => Promise<void>
}

type GroupBy = 'profile' | 'type'

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)   return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function TypeBadge({ type }: { type: CampaignType }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
      padding: '2px 8px', border: `1px solid ${TYPE_COLORS[type]}40`,
      color: TYPE_COLORS[type], background: `${TYPE_COLORS[type]}15`,
      flexShrink: 0,
    }}>
      {TYPE_LABELS[type]}
    </span>
  )
}

function CampaignCard({ c, onDelete, onView }: { c: Campaign; onDelete: () => void; onView: () => void }) {
  const isImage  = c.type === 'image'
  const isVideo  = c.type === 'video'
  const preview  = isImage || isVideo ? null : c.output.slice(0, 140)

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      {/* Image thumbnail */}
      {isImage && c.output && (
        <img src={c.output} alt="" style={{ width: 60, height: 60, objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
      )}
      {isVideo && (
        <div style={{ width: 60, height: 60, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
          🎬
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <TypeBadge type={c.type} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
            {c.title || '(untitled)'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: preview ? 8 : 0, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span>{c.profileName} · {c.niche}</span>
          {c.userEmail && <span style={{ color: 'var(--gold)', opacity: 0.8 }}>{c.userEmail}</span>}
          <span>{timeAgo(c.createdAt)}</span>
        </div>
        {preview && (
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, whiteSpace: 'pre-wrap', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {preview}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={onView} className="copy-btn" style={{ fontSize: 11 }}>View</button>
        <button onClick={onDelete} className="copy-btn" style={{ fontSize: 11, color: 'var(--red)' }}>✕</button>
      </div>
    </div>
  )
}

function CampaignModal({ c, onClose }: { c: Campaign; onClose: () => void }) {
  const isImage = c.type === 'image'
  const isVideo = c.type === 'video'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: '100%', maxWidth: 680, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TypeBadge type={c.type} />
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>{c.title}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-dim)', padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: '16px 20px', fontSize: 11, color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
          {c.profileName} · {c.niche} · {new Date(c.createdAt).toLocaleString()}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {isImage && <img src={c.output} alt="Generated" style={{ width: '100%', maxHeight: 480, objectFit: 'contain', border: '1px solid var(--border)' }} />}
          {isVideo && (
            <video src={c.output} controls autoPlay loop style={{ width: '100%', maxHeight: 420, border: '1px solid var(--border)', background: '#000' }} />
          )}
          {!isImage && !isVideo && (
            <pre style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text)', margin: 0 }}>
              {c.output}
            </pre>
          )}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          {!isImage && !isVideo && (
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(c.output)}>⧉ Copy</button>
          )}
          {isImage && (
            <a href={c.output} download="campaign-image.png" className="copy-btn" style={{ textDecoration: 'none' }}>⬇ Download</a>
          )}
          {isVideo && (
            <a href={c.output} download="campaign-video.mp4" className="copy-btn" style={{ textDecoration: 'none' }}>⬇ Download</a>
          )}
          <button className="copy-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export function CampaignsPage({ profiles, campaigns, onDeleteCampaign }: Props) {
  const [groupBy, setGroupBy]             = useState<GroupBy>('profile')
  const [filterProfile, setFilterProfile] = useState<string>('all')
  const [filterType, setFilterType]       = useState<CampaignType | 'all'>('all')
  const [viewing, setViewing]             = useState<Campaign | null>(null)

  const handleDelete = (id: string) => { onDeleteCampaign(id) }

  const filtered = campaigns.filter(c => {
    if (filterProfile !== 'all' && c.profileId !== filterProfile) return false
    if (filterType !== 'all' && c.type !== filterType) return false
    return true
  })

  // Group
  const grouped: { key: string; label: string; items: Campaign[] }[] = []
  if (groupBy === 'profile') {
    const profileIds = [...new Set(filtered.map(c => c.profileId))]
    for (const pid of profileIds) {
      const items = filtered.filter(c => c.profileId === pid)
      const p = profiles.find(pr => pr.id === pid)
      grouped.push({ key: pid, label: p ? `${p.name} · ${p.niche}` : items[0]?.profileName || pid, items })
    }
  } else {
    const types = [...new Set(filtered.map(c => c.type))] as CampaignType[]
    for (const t of types) {
      grouped.push({ key: t, label: TYPE_LABELS[t], items: filtered.filter(c => c.type === t) })
    }
  }

  const allTypes = [...new Set(campaigns.map(c => c.type))] as CampaignType[]

  return (
    <div>
      {viewing && <CampaignModal c={viewing} onClose={() => setViewing(null)} />}

      <div className="page-title">Campaigns</div>
      <div className="page-sub">All saved generations — browse by profile or type</div>

      {/* Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {/* Group by */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Group by</span>
          {(['profile', 'type'] as GroupBy[]).map(g => (
            <button key={g} className={`chip ${groupBy === g ? 'active' : ''}`}
              onClick={() => setGroupBy(g)} style={{ fontSize: 12, padding: '5px 12px', textTransform: 'capitalize' }}>
              {g}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {/* Filter by profile */}
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value)}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, padding: '5px 10px', fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All profiles</option>
          {profiles.map(p => <option key={p.id} value={p.id}>{p.name} · {p.niche}</option>)}
        </select>

        {/* Filter by type */}
        <select value={filterType} onChange={e => setFilterType(e.target.value as CampaignType | 'all')}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, padding: '5px 10px', fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All types</option>
          {allTypes.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-dim)' }}>{filtered.length} campaign{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Empty state */}
      {campaigns.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
          <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No campaigns yet</div>
          <div style={{ fontSize: 14 }}>Generate content in any tool and hit "Save to Campaigns" to build your library here.</div>
        </div>
      )}

      {/* Grouped sections */}
      {grouped.map(group => (
        <div key={group.key} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {groupBy === 'type' && <TypeBadge type={group.key as CampaignType} />}
            <span style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{group.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--border)' }}>
            {group.items.map(c => (
              <CampaignCard key={c.id} c={c}
                onDelete={() => handleDelete(c.id)}
                onView={() => setViewing(c)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
