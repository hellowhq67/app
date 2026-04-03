export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-01-06'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Sanity projectId must only contain a-z, 0-9, and dashes.
// Use a dummy value during build when the real ID is not configured.
const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const isValidProjectId = /^[a-z0-9-]+$/.test(rawProjectId)
export const projectId = isValidProjectId ? rawProjectId : 'not-configured'
