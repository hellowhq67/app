import { apiError } from './response'

/**
 * Custom API error class for typed error handling
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  toResponse() {
    return apiError(this.status, this.message, this.code)
  }
}

/**
 * Common error factory functions
 */
export const Errors = {
  unauthorized: (message = 'Unauthorized') =>
    new ApiError(401, message, 'UNAUTHORIZED'),

  forbidden: (message = 'Forbidden') =>
    new ApiError(403, message, 'FORBIDDEN'),

  notFound: (resource = 'Resource') =>
    new ApiError(404, `${resource} not found`, 'NOT_FOUND'),

  badRequest: (message: string) =>
    new ApiError(400, message, 'BAD_REQUEST'),

  conflict: (message: string) =>
    new ApiError(409, message, 'CONFLICT'),

  rateLimited: (message = 'Rate limit exceeded') =>
    new ApiError(429, message, 'RATE_LIMITED'),

  internal: (message = 'Internal Server Error') =>
    new ApiError(500, message, 'INTERNAL_ERROR'),

  unsupportedMediaType: (message = 'Unsupported media type') =>
    new ApiError(415, message, 'UNSUPPORTED_MEDIA_TYPE'),
}

/**
 * Handle errors and return appropriate response
 */
export function handleApiError(error: unknown, logContext?: string) {
  if (error instanceof ApiError) {
    return error.toResponse()
  }

  if (logContext) {
    console.error(`[${logContext}]`, error)
  }

  return Errors.internal().toResponse()
}
