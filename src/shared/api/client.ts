import type { ApiErrorBody } from './types'

const TOKEN_KEY = 'entradasya.access-token'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get()
  const isFormData = options.body instanceof FormData
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let body: ApiErrorBody = {}
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      body = {}
    }
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : body.message || 'No se pudo completar la operación.'
    if (response.status === 401) tokenStorage.clear()
    throw new ApiError(message, response.status, body.code)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function downloadWithAuth(path: string, filename: string): Promise<void> {
  const token = tokenStorage.get()
  const response = await fetch(`/api${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new ApiError('No se pudo descargar la entrada.', response.status)
  const url = URL.createObjectURL(await response.blob())
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
