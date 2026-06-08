type JwtPayload = Record<string, unknown>

/** Reads JWT payload for UI only (no signature verification). */
export function getJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(paddedBase64), (char) => char.charCodeAt(0)),
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function getUserIdFromToken(token: string): number | null {
  try {
    const payload = getJwtPayload(token)
    if (!payload) return null
    const sub = payload.sub
    const userId = payload.user_id
    const id = Number(sub ?? userId ?? payload.id)
    return Number.isFinite(id) ? id : null
  } catch {
    return null
  }
}

export function getIsManagerFromToken(token: string): boolean {
  const payload = getJwtPayload(token)
  const value = payload?.is_manager

  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  if (typeof value === 'number') return value === 1

  return false
}
