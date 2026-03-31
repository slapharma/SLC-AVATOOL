import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { CreatorProfile, StoredProfile } from '../App'
import type { Campaign, CampaignType } from '../lib/campaigns'

interface DataContextType {
  // Profiles
  profiles: StoredProfile[]
  activeId: string
  activeProfile: StoredProfile | null
  loadingProfiles: boolean
  createProfile: (p: CreatorProfile) => Promise<StoredProfile>
  updateProfile: (id: string, updates: Partial<CreatorProfile>) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  switchProfile: (id: string) => void
  // Campaigns
  campaigns: Campaign[]
  loadingCampaigns: boolean
  saveCampaign: (c: Omit<Campaign, 'id' | 'createdAt'>) => Promise<Campaign>
  deleteCampaign: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextType | null>(null)

function rowToProfile(r: Record<string, string>): StoredProfile {
  return {
    id: r.id,
    name: r.name,
    niche: r.niche,
    audience: r.audience,
    offer: r.offer,
    pricePoint: r.price_point,
    platform: r.platform,
    goal: r.goal,
    currentFollowers: r.current_followers,
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [profiles, setProfiles]               = useState<StoredProfile[]>([])
  const [activeId, setActiveId]               = useState<string>('')
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  const [campaigns, setCampaigns]               = useState<Campaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)

  // Load profiles whenever the authenticated user changes
  useEffect(() => {
    if (!user) {
      setProfiles([])
      setActiveId('')
      setLoadingProfiles(false)
      return
    }
    setLoadingProfiles(true)
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const ps = (data ?? []).map(rowToProfile)
        setProfiles(ps)
        setActiveId(ps[0]?.id ?? '')
        setLoadingProfiles(false)
      })
  }, [user])

  // Load campaigns whenever the authenticated user changes
  useEffect(() => {
    if (!user) {
      setCampaigns([])
      setLoadingCampaigns(false)
      return
    }
    setLoadingCampaigns(true)
    supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const cs: Campaign[] = (data ?? []).map(r => ({
          id: r.id,
          type: r.type as CampaignType,
          profileId: r.profile_id,
          profileName: r.profile_name,
          niche: r.niche,
          title: r.title,
          output: r.output,
          createdAt: r.created_at,
          userEmail: r.user_email,
        }))
        setCampaigns(cs)
        setLoadingCampaigns(false)
      })
  }, [user])

  const createProfile = useCallback(async (p: CreatorProfile): Promise<StoredProfile> => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    await supabase.from('profiles').insert({
      id,
      user_id: user!.id,
      user_email: user!.email ?? '',
      name: p.name,
      niche: p.niche,
      audience: p.audience,
      offer: p.offer,
      price_point: p.pricePoint,
      platform: p.platform,
      goal: p.goal,
      current_followers: p.currentFollowers,
    })
    const sp: StoredProfile = { ...p, id }
    setProfiles(prev => {
      const next = [...prev, sp]
      if (!activeId) setActiveId(id)
      return next
    })
    return sp
  }, [user, activeId])

  const updateProfile = useCallback(async (id: string, updates: Partial<CreatorProfile>) => {
    const row: Record<string, string> = {}
    if (updates.name !== undefined)            row.name = updates.name
    if (updates.niche !== undefined)           row.niche = updates.niche
    if (updates.audience !== undefined)        row.audience = updates.audience
    if (updates.offer !== undefined)           row.offer = updates.offer
    if (updates.pricePoint !== undefined)      row.price_point = updates.pricePoint
    if (updates.platform !== undefined)        row.platform = updates.platform
    if (updates.goal !== undefined)            row.goal = updates.goal
    if (updates.currentFollowers !== undefined) row.current_followers = updates.currentFollowers
    await supabase.from('profiles').update(row).eq('id', id)
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deleteProfile = useCallback(async (id: string) => {
    await supabase.from('profiles').delete().eq('id', id)
    setProfiles(prev => {
      const remaining = prev.filter(p => p.id !== id)
      if (activeId === id) setActiveId(remaining[0]?.id ?? '')
      return remaining
    })
  }, [activeId])

  const switchProfile = useCallback((id: string) => setActiveId(id), [])

  const saveCampaign = useCallback(async (c: Omit<Campaign, 'id' | 'createdAt'>): Promise<Campaign> => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const createdAt = Date.now()
    await supabase.from('campaigns').insert({
      id,
      user_id: user!.id,
      user_email: user!.email ?? '',
      type: c.type,
      profile_id: c.profileId,
      profile_name: c.profileName,
      niche: c.niche,
      title: c.title,
      output: c.output,
      created_at: createdAt,
    })
    const full: Campaign = { ...c, id, createdAt }
    setCampaigns(prev => [full, ...prev])
    return full
  }, [user])

  const deleteCampaign = useCallback(async (id: string) => {
    await supabase.from('campaigns').delete().eq('id', id)
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }, [])

  const activeProfile = profiles.find(p => p.id === activeId) || profiles[0] || null

  return (
    <DataContext.Provider value={{
      profiles, activeId, activeProfile, loadingProfiles,
      createProfile, updateProfile, deleteProfile, switchProfile,
      campaigns, loadingCampaigns, saveCampaign, deleteCampaign,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
