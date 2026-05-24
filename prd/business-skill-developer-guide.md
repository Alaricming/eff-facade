# 业务 Skill 开发者指南

## 1. 目标

本文面向接入 EFF Facade 的业务项目开发者，说明如何在宿主项目中创建一个真实业务 Skill。

业务开发者不需要理解 Facade 内部实现，只需要遵守 v0.1 协议：

- 在宿主项目 `src/skills` 下维护 Skill。
- 用 `agent.json` 注册宿主项目的 Skill 列表。
- 每个 Skill 用 `skill.md` 描述自然语言命中信息。
- 每个 Skill 用 `mcp.json` 注册原子能力和自定义组件。
- 原子能力放在 `apis/*.ts`。
- 自定义组件放在 `components/*.vue`。

Facade runtime 负责加载、识别、执行和渲染；业务 Skill 负责封装业务逻辑。

## 2. 最小目录结构

```text
src/
  skills/
    agent.json
    user-profile-skill/
      skill.md
      mcp.json
      apis/
        get-user-profile.ts
        request.ts
      components/
        UserProfileCard.vue
```

一个宿主项目只维护一个 `src/skills/agent.json`。一个 `agent.json` 可以注册多个 Skill。

## 3. 创建 `agent.json`

`agent.json` 注册宿主项目中所有可被 Facade 发现的 Skill。

```json
{
  "schemaVersion": "0.1",
  "id": "wms-agent",
  "name": "WMS Agent",
  "description": "WMS 项目的 EFF Facade Skills",
  "version": "0.0.0",
  "skills": [
    {
      "id": "user-profile-skill",
      "path": "./user-profile-skill",
      "enabled": true
    }
  ]
}
```

规则：

- `schemaVersion` 当前固定为 `0.1`。
- `skills[].id` 需要与对应 Skill 的 `mcp.json.id` 一致。
- `skills[].path` 相对 `src/skills`。
- `enabled: false` 可以临时禁用某个 Skill。

## 4. 编写 `skill.md`

`skill.md` 用于 Skill 召回、模型判断和业务说明。它不注册能力，也不执行代码。

```md
# 用户信息 Skill

## Skill ID

user-profile-skill

## 描述

用于查询企业内部用户当前信息、部门、角色和最近操作。

## 典型表达

- 查看用户 u1001 的当前信息
- 查询张三的用户资料
- 看一下用户 u2002 最近操作

## 输入参数

- userId: 用户 ID
- name: 用户姓名，可选

## 结果

返回用户基础信息和最近操作列表。

## 不适用场景

- 不创建或修改用户。
- 不处理权限审批。
```

建议：

- 写具体用户会说的话。
- 明确输入参数和结果形态。
- 写清楚不适用场景，减少误命中。
- 不要把内部接口路径、实现细节写得过重。

## 5. 编写 `mcp.json`

`mcp.json` 是 Skill 的注册清单，声明可执行原子能力和可渲染自定义组件。

```json
{
  "schemaVersion": "0.1",
  "id": "user-profile-skill",
  "name": "用户信息 Skill",
  "description": "查询用户当前信息和最近操作",
  "version": "0.0.0",
  "skillDoc": "./skill.md",
  "riskLevel": "low",
  "abilities": [
    {
      "id": "get_user_profile",
      "title": "查询用户信息",
      "description": "查询用户当前信息并展示到会话中",
      "entry": "./apis/get-user-profile.ts",
      "exportName": "getUserProfile",
      "renderType": "mixed",
      "requiresConfirmation": false
    }
  ],
  "components": [
    {
      "id": "user_profile_card",
      "title": "用户信息卡片",
      "entry": "./components/UserProfileCard.vue",
      "componentType": "vue"
    }
  ]
}
```

规则：

- `skillDoc` 指向当前 Skill 下的 `skill.md`。
- `abilities[].entry` 相对 Skill 目录。
- `abilities[].exportName` 必须与 `apis/*.ts` 中的导出函数一致。
- `renderType` 描述原子能力主要返回类型，用于调试和理解。
- 写操作建议设置 `requiresConfirmation: true`，并返回 `confirmation` 结果。
- `components[].id` 必须与 `component` result 中的 `componentId` 一致。

## 6. 编写原子能力

原子能力是模型可调用的最小业务能力。每个 `apis/*.ts` 建议只负责一个业务动作。

```ts
import type { AtomicAbilityInput, FacadeContext } from '@eff-facade/facade'
import { request } from './request'

export async function getUserProfile(
  ctx: FacadeContext,
  input: AtomicAbilityInput
) {
  const userId = String(input.params?.userId ?? 'u1001')
  const response = await request<{
    data: {
      userId: string
      name: string
      department: string
      role: string
      status: string
      recentActions: Array<{
        time: string
        action: string
        target: string
      }>
    }
  }>(ctx, {
    url: `/api/users/${userId}`
  })

  const profile = response.data

  return {
    type: 'mixed',
    status: 'done',
    title: '用户信息',
    blocks: [
      {
        type: 'description',
        status: 'done',
        title: '当前用户',
        data: {
          userId: profile.userId,
          name: profile.name,
          department: profile.department,
          role: profile.role,
          status: profile.status
        }
      },
      {
        type: 'table',
        status: 'done',
        title: '最近操作',
        columns: [
          { key: 'time', title: '时间' },
          { key: 'action', title: '动作' },
          { key: 'target', title: '对象' }
        ],
        dataSource: profile.recentActions
      }
    ]
  } as const
}
```

建议在每个 Skill 内部封装局部 `request.ts`：

```ts
import type { FacadeContext, HttpRequestInput } from '@eff-facade/facade'

export const request = async <T>(ctx: FacadeContext, input: HttpRequestInput) => {
  if (!ctx.adapters.http.request) {
    throw new Error('HTTP adapter is not configured.')
  }

  return ctx.adapters.http.request<T>(input)
}
```

## 7. 处理表单提交

标准表单通过 `submitAction.abilityId` 调用一个已注册原子能力。首次调用通常来自模型，提交调用来自组件。

```ts
export async function createDictionary(
  ctx: FacadeContext,
  input: AtomicAbilityInput
) {
  if (input.source === 'component') {
    const response = await request<{ data: { code: string } }>(ctx, {
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

  return {
    type: 'form',
    status: 'waiting_user_input',
    title: '创建业务字典',
    jsonSchema: {
      type: 'object',
      required: ['code', 'name'],
      properties: {
        code: { type: 'string', title: '字典编码', default: input.params?.code },
        name: { type: 'string', title: '字典名称', default: input.params?.code }
      }
    },
    uiSchema: {
      fields: {
        code: { component: 'input', order: 1 },
        name: { component: 'input', order: 2 }
      }
    },
    submitAction: {
      abilityId: 'create_dictionary'
    }
  } as const
}
```

## 8. 处理二次确认

写操作可以返回 `confirmation`，由渲染层展示确认卡片，确认后调用 `confirmAction.abilityId`。

```ts
export async function createSku(ctx: FacadeContext, input: AtomicAbilityInput) {
  if (input.source === 'component') {
    const response = await request<{ data: { skuCode: string } }>(ctx, {
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
      skuCode: input.params?.skuCode ?? 'SKU-001',
      skuName: input.params?.skuName ?? '蓝牙耳机'
    },
    confirmText: '确认创建',
    cancelText: '暂不创建',
    confirmAction: {
      abilityId: 'create_sku'
    }
  } as const
}
```

## 9. 使用自定义组件

当标准 Schema UI 不足以表达业务内容时，可以注册自定义组件。

原子能力返回：

```ts
return {
  type: 'component',
  status: 'done',
  title: '用户信息卡片',
  componentId: 'user_profile_card',
  props: {
    userId: 'u1001',
    name: '张三'
  }
} as const
```

组件示例：

```vue
<template>
  <section class="space-y-2 rounded-eff-lg border border-eff-border bg-eff-surface p-3">
    <p class="text-sm font-semibold text-eff-text">{{ name }}</p>
    <p class="text-xs text-eff-muted">{{ userId }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  userId: string
  name: string
}>()
</script>
```

规则：

- 自定义组件由宿主项目编译。
- 自定义组件可以使用宿主项目已安装依赖。
- Facade 不负责安装宿主项目 UI 组件库。
- 优先使用标准 Schema UI；只有标准表达不足时再注册自定义组件。

## 10. 常用结果类型

| 类型 | 使用场景 |
| --- | --- |
| `message` | 普通文本结果、保存成功提示 |
| `form` | 一次性生成式表单 |
| `confirmation` | 写操作前的二次确认 |
| `description` | 详情信息展示 |
| `table` | 列表或记录展示 |
| `link-card` | 复杂业务跳转 |
| `component` | 自定义组件 |
| `mixed` | 多个 block 混合展示 |
| `error` | 业务或运行错误 |

## 11. 本地验证

启动 Mock Server：

```bash
pnpm --filter @eff-facade/mock-server dev
```

启动 Vue Demo：

```bash
pnpm --filter @eff-facade/vue-demo dev -- --host 127.0.0.1
```

验证：

- Skill 是否被 `agent.json` 注册。
- `mcp.json` 的 `entry` 和 `exportName` 是否正确。
- `skill.md` 中是否包含典型表达。
- Workbench 是否能命中 Skill。
- 右侧调试面板是否显示目标 Skill 和 Ability。
- 任务历史是否记录执行结果。

Vue Demo 中可以先运行示例 Skill 协议校验：

```bash
pnpm --filter @eff-facade/vue-demo validate:skills
```

## 12. 检查清单

- `src/skills/agent.json` 存在。
- 新 Skill 已注册到 `agent.json`。
- Skill 目录下存在 `skill.md`。
- Skill 目录下存在 `mcp.json`。
- `mcp.json.id` 与 `agent.json.skills[].id` 一致。
- `mcp.json.abilities[].entry` 文件存在。
- `mcp.json.abilities[].exportName` 与代码导出一致。
- 原子能力返回标准 result。
- 自定义组件已注册到 `components`。
- 自定义组件 `componentId` 与 `mcp.json.components[].id` 一致。
- 写操作有二次确认或清晰的用户提交动作。

## 13. 参考示例

- `examples/vue-demo/src/skills/dictionary-skill`：`mixed(form + component)` 与提交保存。
- `examples/vue-demo/src/skills/business-skill`：`confirmation`、`link-card`、`mixed(description + table)`。

协议详情见 [protocol-v0.1.md](./protocol-v0.1.md)。
