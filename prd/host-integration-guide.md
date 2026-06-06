# 宿主项目接入指南

## 1. 目标

本文描述业务宿主项目如何接入 EFF Facade，并如何通过工具 Skill 创建业务 Skill。

接入目标：

- 宿主项目安装 Facade 主包。
- 宿主项目配置 Skill 根目录。
- 业务 Skill 放在宿主项目 `src/skills` 下。
- Codex / Claude 等开发工具通过 `eff-facade-skill-creator` 辅助创建业务 Skill。
- Facade runtime 不依赖 `skill-creator`。

## 2. 安装主包

```bash
pnpm add @eff-facade/facade
```

`@eff-facade/facade` 是宿主项目唯一需要直接安装的 Facade 包。主包会聚合导出 Runtime、Workbench、Schema UI、Mock Model Adapter 和 Vite 插件。

## 3. Vite 配置

```ts
import vue from '@vitejs/plugin-vue'
import { effFacadePlugin } from '@eff-facade/facade/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    effFacadePlugin({
      skillRoot: 'src/skills'
    })
  ]
})
```

插件职责：

- 读取 `src/skills/agent.json`。
- 读取每个 Skill 的 `mcp.json`。
- 读取每个 Skill 的 `skill.md`。
- 生成原子能力和原子组件动态 import。
- 提供 `virtual:eff-facade/skills` 虚拟模块。

## 3.1 MVP Tailwind 配置

Stage 9 阶段，Workbench 已归属 `packages/workbench`，但仍使用 Tailwind class 作为 UI 样式表达。

Vue Demo 需要在 Tailwind `content` 中扫描 Workbench 和 Vue renderer：

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts}',
    '../../packages/vue-renderer/src/**/*.{vue,ts}',
    '../../packages/workbench/src/**/*.{vue,ts}'
  ]
} satisfies Config
```

真实发布后不应要求宿主扫描 Facade 内部源码。Stage 10 需要通过 Web Component / mount API 和独立样式产物收口该问题。

## 4. 宿主 Skills 目录

```text
src/
  skills/
    agent.json
    dictionary-skill/
      skill.md
      mcp.json
      apis/
        create-dictionary.ts
      components/
        DictionaryPreview.vue
```

一个宿主项目只维护一个 `agent.json`。

## 5. agent.json

```json
{
  "schemaVersion": "0.1",
  "id": "wms-agent",
  "name": "WMS Agent",
  "description": "WMS 项目的 EFF Facade Skills",
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

## 6. Workbench 挂载

```vue
<template>
  <EffFacadeWorkbench
    :runtime="runtime"
    runtime-status-text="WMS runtime"
  />
</template>

<script setup lang="ts">
import {
  EffFacadeWorkbench,
  createMockModelAdapter,
  createRuntime,
  type FacadeAdapters
} from '@eff-facade/facade'
import { shallowRef } from 'vue'
import skillRegistry from 'virtual:eff-facade/skills'

const adapters: FacadeAdapters = {
  model: createMockModelAdapter(),
  http: {
    request: async (input) => {
      const response = await fetch(input.url, {
        method: input.method ?? 'GET',
        headers: {
          'content-type': 'application/json',
          ...input.headers
        },
        body: input.body === undefined ? undefined : JSON.stringify(input.body)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${input.url}`)
      }

      return response.json()
    }
  },
  router: {
    resolve: (href) => href,
    open: (href) => window.history.pushState({}, '', href)
  }
}

const runtime = shallowRef(
  createRuntime({
    registry: skillRegistry,
    adapters
  })
)
</script>
```

## 7. Adapter 标准

宿主项目通过 Adapter 注入模型、接口和路由能力。

MVP 必填 Adapter：

- `model`：负责普通问答、Skill 意图识别和参数提取。
- `http`：负责原子能力或组件需要的 HTTP 请求。
- `router`：负责跳转到宿主项目页面。

### 7.1 Model Adapter

```ts
const model = {
  type: 'mock',
  judge: async ({ rawText, candidates }) => {
    return {
      skillId: 'dictionary-skill',
      abilityId: 'create_dictionary',
      params: {},
      confidence: 0.9
    }
  },
  chat: async ({ rawText }) => ({
    content: `普通问答回复：${rawText}`
  })
}
```

约定：

- `type` 用于设置面板和调试信息展示。
- `judge` 返回 `fallbackToChat: true` 时进入普通问答。
- `judge` 返回的 `skillId` 和 `abilityId` 必须来自候选 Skill。
- `params` 是模型提取的结构化参数，会传给原子能力。
- `chat` 用于未命中业务 Skill 的普通问答。

### 7.2 HTTP Adapter

```ts
const http = {
  request: async (input) => {
    const response = await fetch(input.url, {
      method: input.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        ...input.headers
      },
      body: input.body === undefined ? undefined : JSON.stringify(input.body)
    })

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => undefined)
      throw new Error(
        errorPayload?.error?.message ??
          errorPayload?.message ??
          `HTTP ${response.status}: ${input.url}`
      )
    }

    return response.json()
  }
}
```

约定：

- 鉴权、租户、环境和 baseURL 由宿主项目在 Adapter 内处理。
- Facade Runtime 不直接感知 token、cookie、网关和业务域名。
- 非 2xx 响应应抛出业务可读错误，Runtime 会下行为 `error` 消息。

### 7.3 Router Adapter

```ts
const router = {
  resolve: (href) => href,
  open: (href) => router.push(href)
}
```

约定：

- `resolve` 用于把 Skill 返回的相对链接转换为宿主可访问地址。
- `open` 用于真正跳转，可以接 Vue Router、React Router 或微前端路由。
- 复杂业务优先通过 `link-card` 跳转到宿主项目已有页面，不强行在 Facade 内重做所有流程。

Workbench 可选配置：

- `initialPrompt`：初始化输入区文本，常用于 demo 或验收场景。
- `title`：顶部标题。
- `eyebrow`：空会话状态的辅助文案。
- `emptyTitle`：空会话状态的主标题。
- `runtimeStatusText`：顶部运行状态文案，由宿主项目决定。
- `examplePrompts`：空会话状态下展示的示例请求。

不传配置时，Workbench 会从 Runtime 中读取模型类型、Agent 名称、Skill 数量、原子能力数量和原子组件数量，用于设置面板展示。

## 8. 安装工具 Skill

`eff-facade-skill-creator` 是给编码工具使用的 Skill，不是 Facade runtime 依赖。

Codex:

```text
.codex/
  skills/
    eff-facade-skill-creator/
      SKILL.md
```

Claude:

```text
.claude/
  skills/
    eff-facade-skill-creator/
      SKILL.md
```

工具 Skill 的职责：

- 创建 `agent.json`。
- 创建 `skill.md`。
- 创建 `mcp.json`。
- 创建 `apis/*.ts` 原子能力。
- 创建 `components/*.vue` 自定义组件。
- 遵守 EFF Facade Skill 协议。

业务 Skill 的手写开发流程见 [business-skill-developer-guide.md](./business-skill-developer-guide.md)。

## 9. 本地验证

启动 Mock Server：

```bash
pnpm --filter @eff-facade/mock-server dev
```

启动 Vue Demo：

```bash
pnpm --filter @eff-facade/vue-demo dev -- --host 127.0.0.1
```

验证场景：

- 创建字典：表单 + 自定义组件 + 保存。
- 创建 SKU：确认卡 + 保存。
- 创建知识库：链接卡。
- 查询用户：描述信息 + 表格。
- 普通问答：Mock model fallback。
