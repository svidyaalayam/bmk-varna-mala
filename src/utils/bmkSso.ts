import type { BmkUser } from '../types/bmk'

export type BmkHandoff = {
  token: string
  returnTo?: string
  apiOrigin?: string
  displayName?: string
}

function bmkApiOrigin(origin?: string): string {
  const raw = (origin || import.meta.env.VITE_BMK_API_URL || 'http://localhost:8080').trim()
  return raw.replace(/\/$/, '')
}

export function readBmkHandoff(): BmkHandoff | null {
  if (!window.location.hash) return null

  const params = new URLSearchParams(window.location.hash.slice(1))
  const token = params.get('bmk_token')?.trim()
  if (!token) return null

  const returnTo = params.get('return_to') || undefined
  const apiOrigin = params.get('bmk_api') || undefined
  const displayName = params.get('bmk_name')?.trim() || undefined
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
  return { token, returnTo, apiOrigin, displayName }
}

export async function fetchBmkUser(token: string, apiOrigin?: string): Promise<BmkUser> {
  const response = await fetch(`${bmkApiOrigin(apiOrigin)}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Could not load the BMK user profile.')
  return response.json() as Promise<BmkUser>
}

export function displayBmkName(user: BmkUser): string {
  return `${user.first_name} ${user.last_name}`.trim() || user.username
}
