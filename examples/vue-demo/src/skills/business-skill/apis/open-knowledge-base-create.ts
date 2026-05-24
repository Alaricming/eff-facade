import type { AtomicAbilityInput, FacadeContext } from '@eff-facade/facade'
import { request } from './request'

export async function openKnowledgeBaseCreate(
  ctx: FacadeContext,
  _input: AtomicAbilityInput
) {
  const response = await request<{
    data: {
      title: string
      description: string
      href: string
    }
  }>(ctx, {
    url: '/api/knowledge-base/link'
  })

  return {
    type: 'link-card',
    status: 'done',
    title: response.data.title,
    description: response.data.description,
    href: response.data.href
  } as const
}
