export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (
      error.body &&
      typeof error.body === 'object' &&
      'detail' in error.body &&
      typeof (error.body as { detail: unknown }).detail === 'string'
    ) {
      return (error.body as { detail: string }).detail
    }
    if (error.status > 0) {
      return `${fallback} (${error.status})`
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
}

export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, signal, timeoutMs = 30_000 } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const response = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const contentType = response.headers.get('content-type')
    const parsedBody =
      contentType?.includes('application/json')
        ? await response.json()
        : await response.text()

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.status}`,
        response.status,
        parsedBody,
      )
    }

    return parsedBody as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out or was aborted', 0, null)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onAbort)
  }
}
