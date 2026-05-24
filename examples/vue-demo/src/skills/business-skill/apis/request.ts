import type { FacadeContext, HttpRequestInput } from '@eff-facade/facade'

export const request = async <T>(ctx: FacadeContext, input: HttpRequestInput) => {
  if (!ctx.adapters.http.request) {
    throw new Error('HTTP adapter is not configured.')
  }

  return ctx.adapters.http.request<T>(input)
}
