import crypto from 'crypto'

export function generateToken(): string {
  const uuid = crypto.randomUUID()
  const randomPart = crypto.randomBytes(16).toString('hex')
  return `${uuid}-${randomPart}`
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateLinkToken(): { token: string; hash: string } {
  const token = generateToken()
  const hash = hashToken(token)
  return { token, hash }
}