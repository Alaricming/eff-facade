import type { AtomicAbilityInput, FacadeContext } from '@eff-facade/facade'
import { request } from './request'

export async function createDictionary(
  ctx: FacadeContext,
  input: AtomicAbilityInput
) {
  if (input.source === 'component') {
    const response = await request<{
      data: {
        code: string
      }
    }>(ctx, {
      url: '/api/dictionaries',
      method: 'POST',
      body: input.formData
    })

    return {
      type: 'message',
      status: 'done',
      content: `已保存字典：${response.data.code}`
    } as const
  }

  const formResult = {
    type: 'form',
    status: 'waiting_user_input',
    title: '创建业务字典',
    jsonSchema: {
      type: 'object',
      required: ['code', 'name', 'status', 'owner', 'priority'],
      properties: {
        code: {
          type: 'string',
          title: '字典编码',
          description: '系统内唯一的字典编码。',
          default: input.params?.code
        },
        name: {
          type: 'string',
          title: '字典名称',
          default: input.params?.code
        },
        status: {
          type: 'string',
          title: '启用状态',
          enum: ['enabled', 'disabled'],
          enumNames: ['启用', '停用'],
          default: 'enabled'
        },
        owner: {
          type: 'string',
          title: '负责人',
          enum: ['warehouse', 'product', 'operation'],
          enumNames: ['仓储团队', '商品团队', '运营团队'],
          default: 'warehouse'
        },
        priority: {
          type: 'number',
          title: '优先级',
          default: 1
        },
        effectiveDate: {
          type: 'string',
          title: '生效日期',
          default: '2026-05-24'
        },
        notifyOwner: {
          type: 'boolean',
          title: '通知负责人',
          default: true
        },
        lockedCode: {
          type: 'string',
          title: '系统识别编码',
          default: input.params?.code
        },
        description: {
          type: 'string',
          title: '描述'
        }
      }
    },
    uiSchema: {
      fields: {
        code: {
          component: 'input',
          placeholder: '例如 storage_level',
          helpText: '只允许小写字母、数字和下划线，创建后通常不建议修改。',
          order: 1
        },
        name: {
          component: 'input',
          placeholder: '例如 库存水位',
          order: 2
        },
        status: {
          component: 'radio',
          order: 3
        },
        owner: {
          component: 'select',
          order: 4
        },
        priority: {
          component: 'number',
          helpText: '数字越小优先级越高。',
          order: 5
        },
        effectiveDate: {
          component: 'date',
          order: 6
        },
        notifyOwner: {
          component: 'checkbox',
          helpText: '保存后通知负责人检查字典配置。',
          order: 7
        },
        lockedCode: {
          component: 'input',
          disabled: true,
          helpText: '该字段用于验证 disabled 状态，不会要求用户编辑。',
          order: 8
        },
        description: {
          component: 'textarea',
          placeholder: '补充这个字典的业务用途',
          order: 9
        }
      }
    },
    submitAction: {
      abilityId: 'create_dictionary'
    }
  } as const

  return {
    type: 'mixed',
    status: 'waiting_user_input',
    title: '创建业务字典',
    blocks: [
      formResult,
      {
        type: 'component',
        status: 'done',
        title: '字典预览',
        componentId: 'dictionary_preview',
        props: {
          code: input.params?.code,
          items: input.params?.items
        }
      }
    ]
  } as const
}
