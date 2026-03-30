export type CampaignType = 'script' | 'hooks' | 'caption' | 'image' | 'video' | 'calendar' | 'funnel'

export type Campaign = {
  id: string
  type: CampaignType
  profileId: string
  profileName: string
  niche: string
  title: string       // topic / subject used
  output: string      // text, URL, or stringified JSON
  createdAt: number
}

const KEY = 'sre_campaigns'

export function loadCampaigns(): Campaign[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function saveCampaign(c: Omit<Campaign, 'id' | 'createdAt'>): Campaign {
  const full: Campaign = {
    ...c,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  }
  const all = [full, ...loadCampaigns()]
  localStorage.setItem(KEY, JSON.stringify(all))
  return full
}

export function deleteCampaign(id: string) {
  const updated = loadCampaigns().filter(c => c.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export const TYPE_LABELS: Record<CampaignType, string> = {
  script:   'Script',
  hooks:    'Hooks',
  caption:  'Caption',
  image:    'Image',
  video:    'Video',
  calendar: 'Calendar',
  funnel:   'Funnel',
}

export const TYPE_COLORS: Record<CampaignType, string> = {
  script:   '#60a5fa',
  hooks:    '#c084fc',
  caption:  '#fb923c',
  image:    '#4ade80',
  video:    '#f43f5e',
  calendar: '#c8a96e',
  funnel:   '#818cf8',
}
