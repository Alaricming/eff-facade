import type { AtomicAbilityInput, FacadeContext } from '@eff-facade/facade'
import { request } from './request'

const DEFAULT_SKU_CODE = 'SKU-001'
const DEFAULT_SKU_NAME = '蓝牙耳机'

export async function createSku(
  ctx: FacadeContext,
  input: AtomicAbilityInput
) {
  if (input.source === 'component') {
    const response = await request<{
      data: {
        skuCode: string
      }
    }>(ctx, {
      url: '/api/skus',
      method: 'POST',
      body: input.params
    })

    return {
      type: 'message',
      status: 'done',
      content: `SKU 已创建：${response.data.skuCode}`
    } as const
  }

  return {
    type: 'confirmation',
    status: 'waiting_user_input',
    title: '确认创建 SKU',
    requiresConfirmation: true,
    data: {
      skuCode: input.params?.skuCode ?? DEFAULT_SKU_CODE,
      skuName: input.params?.skuName ?? DEFAULT_SKU_NAME,
      category: '默认类目',
      owner: 'Mock User'
    },
    confirmText: '确认创建',
    cancelText: '暂不创建',
    confirmAction: {
      abilityId: 'create_sku'
    }
  } as const
}
