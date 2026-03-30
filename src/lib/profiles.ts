import type { CreatorProfile } from '../App'

export type StoredProfile = CreatorProfile & { id: string }

const PROFILES_KEY = 'sre_profiles'
const ACTIVE_KEY   = 'sre_active_profile'

export function loadProfiles(): StoredProfile[] {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]') } catch { return [] }
}

export function saveProfiles(profiles: StoredProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function loadActiveId(): string {
  return localStorage.getItem(ACTIVE_KEY) || ''
}

export function saveActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function makeProfile(p: CreatorProfile): StoredProfile {
  return { ...p, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
}
