export function generateToken(): string {
  // Generate a random token using crypto API available in browsers
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const randomPart = Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
  
  // Use a simple timestamp + random for UUID-like behavior
  const timestamp = Date.now().toString(36)
  const randomId = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomId}-${randomPart.substring(0, 16)}`
}

export async function hashToken(token: string): Promise<string> {
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Synchronous version for compatibility
export function hashTokenSync(token: string): string {
  // Simple hash implementation for sync operations
  let hash = 0
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

export async function generateLinkToken(): Promise<{ token: string; hash: string }> {
  const token = generateToken()
  const hash = await hashToken(token)
  return { token, hash }
}
