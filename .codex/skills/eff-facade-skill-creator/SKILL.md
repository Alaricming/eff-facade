---
name: eff-facade-skill-creator
description: Help users create real business Skills for EFF Facade host projects. Use when creating or updating src/skills/agent.json, skill.md, mcp.json, apis/*.ts atomic abilities, or components/*.vue custom components for an application integrating @eff-facade/facade.
---

# EFF Facade Business Skill Creator

Use this skill to create business Skills for host projects that integrate EFF Facade.

This is a tool-facing development skill for Codex-like agents. It is not part of the EFF Facade runtime, Vite plugin, or `@eff-facade/facade` dependency graph.

Use `prd/business-skill-developer-guide.md` as the canonical project guide when it is available in the repository.

## Boundaries

- Create business Skills in the host project, usually under `src/skills`.
- Do not add business Skills into Facade core packages.
- Do not add `eff-facade-skill-creator` as a runtime dependency.
- Do not make Facade runtime or build plugins import this tool skill.
- Treat `skill.md` as model-readable matching context, not user-facing docs.

## Structure

```text
src/
  skills/
    agent.json
    some-skill/
      skill.md
      mcp.json
      apis/
        some-ability.ts
      components/
        SomeComponent.vue
```

## agent.json

One host project has one `src/skills/agent.json`.

```json
{
  "schemaVersion": "0.1",
  "id": "wms-agent",
  "name": "WMS Agent",
  "description": "WMS project skills",
  "version": "0.0.0",
  "skills": [
    {
      "id": "dictionary-skill",
      "path": "./dictionary-skill",
      "enabled": true
    }
  ]
}
```

Rules:

- Register every Skill directory here.
- Keep `path` relative to `src/skills`.
- Use `enabled: false` to keep a Skill present but disabled.

## skill.md

Recommended shape:

```md
# 字典管理 Skill

## Skill ID

dictionary-skill

## 描述

用于创建业务字典和字典枚举项。

## 典型表达

- 创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3

## 输入参数

- code: 字典编码
- items: 字典枚举项列表

## 结果

- 下发表单和预览组件，提交后保存字典。
```

Rules:

- Include concrete user phrases.
- Include key parameters and result behavior.
- Avoid implementation details that do not help intent matching.

## mcp.json

```json
{
  "schemaVersion": "0.1",
  "id": "dictionary-skill",
  "name": "字典管理 Skill",
  "description": "用于创建业务字典和字典枚举项",
  "version": "0.0.0",
  "skillDoc": "./skill.md",
  "riskLevel": "medium",
  "abilities": [
    {
      "id": "create_dictionary",
      "title": "创建字典",
      "description": "创建业务字典和枚举项",
      "entry": "./apis/create-dictionary.ts",
      "exportName": "createDictionary",
      "renderType": "mixed",
      "requiresConfirmation": false
    }
  ],
  "components": [
    {
      "id": "dictionary_preview",
      "title": "字典预览",
      "entry": "./components/DictionaryPreview.vue",
      "componentType": "vue"
    }
  ]
}
```

Rules:

- Register every exported atomic ability in `abilities`.
- Register every custom component in `components`.
- `entry` paths are relative to the Skill directory.
- `exportName` must match the named export in `apis/*.ts`.
- Use `renderType` to describe the expected primary result type.
- Use `componentType: "vue"` for Vue SFC custom components in MVP.

## Atomic Abilities

Atomic abilities live in `apis/*.ts` and must be exported as `export async function`.

```ts
import type { AtomicAbilityInput, FacadeContext } from '@eff-facade/facade'

export async function queryUser(ctx: FacadeContext, input: AtomicAbilityInput) {
  return {
    type: 'description',
    status: 'done',
    title: '用户信息',
    data: {
      rawText: input.rawText
    }
  } as const
}
```

Rules:

- Keep one atomic ability focused on one business capability.
- Use `ctx.adapters.http.request` for backend calls, with explicit missing-adapter handling.
- Use `input.source === 'component'` to distinguish form/confirmation submissions from initial model calls.
- Return EFF Facade result protocol objects only.

## Result Templates

Message:

```ts
return {
  type: 'message',
  status: 'done',
  content: '操作已完成'
} as const
```

Form:

```ts
return {
  type: 'form',
  status: 'waiting_user_input',
  title: '创建 SKU',
  jsonSchema: {
    type: 'object',
    required: ['skuCode', 'skuName'],
    properties: {
      skuCode: { type: 'string', title: 'SKU 编码' },
      skuName: { type: 'string', title: 'SKU 名称' }
    }
  },
  uiSchema: {
    fields: {
      skuCode: { component: 'input', order: 1 },
      skuName: { component: 'input', order: 2 }
    }
  },
  submitAction: {
    abilityId: 'create_sku'
  }
} as const
```

Confirmation:

```ts
return {
  type: 'confirmation',
  status: 'waiting_user_input',
  title: '确认创建 SKU',
  requiresConfirmation: true,
  data: {
    skuCode: 'SKU-001'
  },
  confirmAction: {
    abilityId: 'create_sku'
  }
} as const
```

Link card:

```ts
return {
  type: 'link-card',
  status: 'done',
  title: '创建知识库',
  description: '流程较长，将跳转到业务页面继续完成。',
  href: '/knowledge-base/create?from=ai-facade'
} as const
```

Description:

```ts
return {
  type: 'description',
  status: 'done',
  title: '用户信息',
  data: {
    userId: 'u1001',
    name: '张三'
  }
} as const
```

Table:

```ts
return {
  type: 'table',
  status: 'done',
  title: '最近操作',
  columns: [
    { key: 'time', title: '时间' },
    { key: 'action', title: '动作' }
  ],
  dataSource: [
    { time: '2026-05-23 10:12', action: '更新库存' }
  ]
} as const
```

Component:

```ts
return {
  type: 'component',
  status: 'done',
  title: '字典预览',
  componentId: 'dictionary_preview',
  props: {
    code: 'storage_level'
  }
} as const
```

Mixed:

```ts
return {
  type: 'mixed',
  status: 'done',
  blocks: [
    { type: 'message', status: 'done', content: '已解析输入' },
    { type: 'component', status: 'done', componentId: 'dictionary_preview' }
  ]
} as const
```

## Custom Components

Vue component example:

```vue
<template>
  <section class="space-y-2 rounded-eff-lg border border-eff-border bg-eff-surface p-3">
    <p class="text-sm font-semibold text-eff-text">{{ title }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
```

Rules:

- Use the host project environment and dependencies.
- For this project, prefer Tailwind classes and existing design tokens.
- Do not assume Facade has installed the host UI library.
- Keep component-owned interactions inside the component only when standard Schema UI is insufficient.

## Reference Demo Skills

- `examples/vue-demo/src/skills/dictionary-skill`: form + custom component + mock server save.
- `examples/vue-demo/src/skills/business-skill`: confirmation, link-card, description/table mixed result.
