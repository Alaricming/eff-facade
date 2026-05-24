import Fastify from 'fastify'

const DEFAULT_PORT = 4300
const RESERVED_DICTIONARY_CODE = 'existing_dictionary'
const SUCCESS_RESPONSE = {
  success: true
} as const

interface CreateDictionaryBody {
  code?: string
  name?: string
  status?: string
  description?: string
  items?: Array<{
    label: string
    value: string | number
  }>
}

interface CreateSkuBody {
  skuCode?: string
  skuName?: string
  category?: string
  owner?: string
}

export const createMockServer = () => {
  const app = Fastify({
    logger: true
  })

  app.addHook('onRequest', async (request, reply) => {
    reply.header('access-control-allow-origin', '*')
    reply.header('access-control-allow-methods', 'GET,POST,OPTIONS')
    reply.header('access-control-allow-headers', 'content-type')

    if (request.method === 'OPTIONS') {
      reply.code(204).send()
    }
  })

  app.get('/health', async () => ({
    ...SUCCESS_RESPONSE,
    service: '@eff-facade/mock-server'
  }))

  app.post<{ Body: CreateDictionaryBody }>('/api/dictionaries', async (request, reply) => {
    const code = request.body.code ?? 'unknown_dictionary'

    if (code === RESERVED_DICTIONARY_CODE) {
      return reply.code(409).send({
        success: false,
        error: {
          code: 'DICTIONARY_ALREADY_EXISTS',
          message: `字典编码已存在：${code}`
        }
      })
    }

    return {
      ...SUCCESS_RESPONSE,
      data: {
        id: `dict_${code}`,
        code,
        name: request.body.name ?? code,
        status: request.body.status ?? 'enabled',
        description: request.body.description ?? '',
        items: request.body.items ?? [],
        savedAt: new Date().toISOString()
      }
    }
  })

  app.post<{ Body: CreateSkuBody }>('/api/skus', async (request) => {
    const skuCode = request.body.skuCode ?? 'SKU-001'

    return {
      ...SUCCESS_RESPONSE,
      data: {
        id: `sku_${skuCode}`,
        skuCode,
        skuName: request.body.skuName ?? '未命名 SKU',
        category: request.body.category ?? '默认类目',
        owner: request.body.owner ?? 'Mock User',
        status: 'created',
        savedAt: new Date().toISOString()
      }
    }
  })

  app.get<{ Params: { id: string } }>('/api/users/:id', async (request) => ({
    ...SUCCESS_RESPONSE,
    data: {
      userId: request.params.id,
      name: '张三',
      department: '供应链中台',
      role: '仓储运营',
      status: '启用',
      recentActions: [
        {
          time: '2026-05-23 10:12',
          action: '更新库存',
          target: 'storage_level'
        },
        {
          time: '2026-05-23 09:40',
          action: '查看 SKU',
          target: 'SKU-001'
        }
      ]
    }
  }))

  app.get('/api/knowledge-base/link', async () => ({
    ...SUCCESS_RESPONSE,
    data: {
      title: '创建知识库',
      description:
        '知识库创建涉及目录、权限、数据源和导入策略，将跳转到业务页面继续完成。',
      href: '/knowledge-base/create?from=ai-facade&anchor=basic'
    }
  }))

  return app
}

export const startMockServer = async (port = DEFAULT_PORT) => {
  const app = createMockServer()
  await app.listen({
    port,
    host: '127.0.0.1'
  })
  return app
}

if (process.argv[1]?.endsWith('/src/index.js') || process.argv[1]?.endsWith('/dist/index.js')) {
  startMockServer(Number(process.env.PORT ?? DEFAULT_PORT)).catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

export const mockServerPackageName = '@eff-facade/mock-server'
