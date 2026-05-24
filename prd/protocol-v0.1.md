# AI Facade 协议 v0.1

## 1. 范围

本协议定义 MVP 阶段的核心接入契约：

- `agent.json`
- `mcp.json`
- `skill.md`
- 原子能力函数签名
- 原子能力返回结果
- `facadeContext`

v0.1 目标是收敛第一版实现边界，同时保留后续扩展空间。

## 2. `agent.json`

一个宿主项目只支持一个 `agent.json`。

位置：

```text
src/skills/agent.json
```

示例：

```json
{
  "schemaVersion": "0.1",
  "id": "wms-agent",
  "name": "WMS Agent",
  "description": "WMS 项目提供的 AI Facade Skill 集合",
  "version": "0.1.0",
  "skills": [
    {
      "id": "dictionary-skill",
      "path": "./dictionary-skill",
      "enabled": true
    }
  ]
}
```

字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `schemaVersion` | 是 | 协议版本，MVP 为 `0.1` |
| `id` | 是 | 宿主项目 Agent ID |
| `name` | 是 | 宿主项目 Agent 名称 |
| `description` | 否 | 描述 |
| `version` | 否 | Agent 版本 |
| `skills` | 是 | Skill 列表 |

`skills[]` 字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | Skill ID |
| `path` | 是 | Skill 相对路径 |
| `enabled` | 否 | 是否启用，默认 `true` |

## 3. `mcp.json`

位置：

```text
src/skills/{skill}/mcp.json
```

示例：

```json
{
  "schemaVersion": "0.1",
  "id": "dictionary-skill",
  "name": "字典管理 Skill",
  "description": "用于创建和查询业务字典",
  "version": "0.1.0",
  "skillDoc": "./skill.md",
  "riskLevel": "medium",
  "abilities": [
    {
      "id": "create_dictionary",
      "title": "创建字典",
      "description": "创建业务字典和枚举项",
      "entry": "./apis/create-dictionary.ts",
      "exportName": "createDictionary",
      "renderType": "confirmation",
      "requiresConfirmation": true
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

字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `schemaVersion` | 是 | 协议版本，MVP 为 `0.1` |
| `id` | 是 | Skill ID |
| `name` | 是 | Skill 名称 |
| `description` | 否 | Skill 描述 |
| `version` | 否 | Skill 版本 |
| `skillDoc` | 是 | `skill.md` 相对路径 |
| `riskLevel` | 否 | 风险等级：`low`、`medium`、`high` |
| `abilities` | 否 | 原子能力列表 |
| `components` | 否 | 原子组件列表 |

`abilities[]` 字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 原子能力 ID |
| `title` | 是 | 展示名称 |
| `description` | 否 | 能力描述 |
| `entry` | 是 | 原子能力文件路径 |
| `exportName` | 否 | 导出函数名；不填时默认使用 default export |
| `renderType` | 否 | 默认渲染类型 |
| `requiresConfirmation` | 否 | 是否需要二次确认 |
| `riskLevel` | 否 | 能力级风险等级，覆盖 Skill 级配置 |

`components[]` 字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 原子组件 ID |
| `title` | 否 | 展示名称 |
| `entry` | 是 | 组件文件路径 |
| `componentType` | 是 | `vue`、`react`、`web-component` |
| `tagName` | 否 | Web Component 标签名 |

## 4. `skill.md`

位置：

```text
src/skills/{skill}/skill.md
```

`skill.md` 是用于 Skill 召回、模型判断和业务方说明的自然语言文档。它不是运行时代码，也不注册原子能力或组件；真实可执行内容必须在 `mcp.json` 中声明。

MVP 建议包含：

- Skill 名称。
- Skill ID。
- 描述。
- 典型表达。
- 输入参数。
- 结果说明。
- 风险说明或不适用场景。

示例：

```md
# 字典管理 Skill

## Skill ID

dictionary-skill

## 描述

用于创建业务字典和字典枚举项。

## 典型表达

- 创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3
- 新增字典 order_status

## 输入参数

- code: 字典编码
- items: 字典枚举项列表

## 结果

返回用于填写和确认的生成式表单，并在提交后返回保存结果。
```

边界：

- `skill.md` 只参与理解和召回。
- `mcp.json` 才是可执行内容注册清单。
- `skill.md` 中描述的能力必须能在 `mcp.json` 中找到对应原子能力。

## 5. 原子能力函数签名

原子能力最终以 `export async function` 的形式导出。

示例：

```ts
export async function createDictionary(ctx, input) {
  return {
    type: 'message',
    status: 'done',
    content: '字典创建成功'
  }
}
```

建议类型：

```ts
export type AtomicAbility = (
  ctx: FacadeContext,
  input: AtomicAbilityInput
) => Promise<AtomicAbilityResult> | AsyncIterable<AtomicAbilityResult>
```

`input` 建议包含：

```ts
export interface AtomicAbilityInput {
  rawText: string
  params?: Record<string, unknown>
  formData?: Record<string, unknown>
  source: 'model' | 'component' | 'runtime'
  messageId?: string
}
```

说明：

- `rawText`：用户原始输入。
- `params`：模型提取参数。
- `formData`：表单或组件提交数据。
- `source`：调用来源。
- `messageId`：关联消息。

## 6. `facadeContext`

`facadeContext` 是 Runtime 注入给原子能力和原子组件的上下文。

MVP 建议包含：

```ts
export interface FacadeContext {
  user: {
    id: string
    name: string
    roles?: string[]
  }
  agent: {
    id: string
    name: string
  }
  skill: {
    id: string
    name: string
  }
  ability?: {
    id: string
    title: string
  }
  adapters: {
    model: unknown
    http: unknown
    router: unknown
  }
  messages: {
    push: (result: AtomicAbilityResult) => void
    update: (messageId: string, result: AtomicAbilityResult) => void
  }
  abilities: {
    call: (abilityId: string, input: AtomicAbilityInput) => Promise<AtomicAbilityResult>
  }
}
```

MVP 中 `user` 来自 Mock User Context。

后续可扩展：

- 权限上下文。
- 审计上下文。
- Trace ID。
- 租户信息。
- Server-side Executor 信息。

## 7. 原子能力返回结果

v0.1 收敛以下结果类型：

- `message`
- `form`
- `confirmation`
- `description`
- `table`
- `link-card`
- `component`
- `mixed`
- `error`

通用字段：

```ts
export interface BaseResult {
  type: string
  status?: 'pending' | 'running' | 'waiting_user_input' | 'done' | 'error'
  id?: string
  title?: string
}
```

### 6.1 `message`

```json
{
  "type": "message",
  "status": "done",
  "content": "已完成。"
}
```

### 6.2 `form`

```json
{
  "type": "form",
  "status": "waiting_user_input",
  "title": "创建 SKU",
  "jsonSchema": {},
  "uiSchema": {},
  "submitAction": {
    "abilityId": "create_sku"
  }
}
```

MVP 表单字段协议：

`jsonSchema.properties[key]` 常用字段：

| 字段 | 说明 |
| --- | --- |
| `type` | 数据类型，常用 `string`、`number`、`integer`、`boolean` |
| `title` | 默认字段标题 |
| `description` | 字段描述 |
| `default` | 默认值 |
| `enum` | 枚举值 |
| `enumNames` | 枚举展示名，按 `enum` 顺序匹配 |
| `oneOf` / `anyOf` | 可选枚举表达 |

`uiSchema.fields[key]` 常用字段：

| 字段 | 说明 |
| --- | --- |
| `component` | 内置组件名，v0.1 协议包含 `input`、`textarea`、`number`、`date`、`select`、`radio`、`switch`、`checkbox` |
| `label` | 覆盖字段标题 |
| `placeholder` | 输入占位提示 |
| `description` | 覆盖字段描述 |
| `helpText` | 辅助说明 |
| `order` | 字段排序 |
| `hidden` | 是否隐藏 |
| `disabled` | 是否禁用 |
| `x-reactions` | 字段联动扩展位，v0.1 暂不实现 |

当前实现状态：

- 已实现：`input`、`textarea`、`number`、`select`、`radio`、`switch`、`description`、`helpText`、`hidden`、`disabled`、required 校验。
- Stage 8 补齐：`checkbox`、`date`。
- 预留不实现：异步选项、字段联动、动态数组、分步骤表单。

### 6.3 `confirmation`

```json
{
  "type": "confirmation",
  "status": "waiting_user_input",
  "title": "确认创建字典",
  "requiresConfirmation": true,
  "data": {},
  "confirmAction": {
    "abilityId": "create_dictionary"
  }
}
```

### 6.4 `description`

```json
{
  "type": "description",
  "title": "用户信息",
  "data": {
    "userId": "10001",
    "name": "张三"
  }
}
```

### 6.5 `table`

```json
{
  "type": "table",
  "title": "查询结果",
  "columns": [],
  "dataSource": []
}
```

### 6.6 `link-card`

```json
{
  "type": "link-card",
  "title": "创建知识库",
  "description": "跳转到知识库系统继续完成。",
  "href": "/knowledge-base/create"
}
```

### 6.7 `component`

```json
{
  "type": "component",
  "componentId": "dictionary_preview",
  "props": {}
}
```

### 6.8 `mixed`

```json
{
  "type": "mixed",
  "blocks": []
}
```

### 6.9 `error`

```json
{
  "type": "error",
  "status": "error",
  "message": "创建失败",
  "detail": "字典编码已存在"
}
```

## 8. v0.1 支持矩阵

| 能力 | v0.1 状态 | 说明 |
| --- | --- | --- |
| 单宿主 `agent.json` | 已支持 | 一个宿主项目一个 Agent |
| 多 Agent | 预留 | 远期统一平台再考虑 |
| `skill.md` 召回 | 已支持 | 当前为轻量关键词召回，后续可替换检索策略 |
| `mcp.json` 注册能力 | 已支持 | 注册原子能力与原子组件 |
| 浏览器端原子能力执行 | 已支持 | MVP 默认方式 |
| Server-side Executor | 预留 | 公司级治理阶段补齐 |
| Mock Model Adapter | 已支持 | 默认使用 |
| Real Model Adapter | 预留接口 | P3 阶段实现 |
| Vue 组件 | 已支持 | MVP renderer |
| React 组件 | 协议预留 | P4 阶段实现 |
| Web Component | 协议预留 | 跨框架策略 |
| 多轮上下文 | 暂不支持 | 保留消息结构 |
| SSO / 权限 / 审计 | 暂不支持 | P5 阶段补齐 |

## 9. 扩展策略

v0.1 保留扩展能力：

- `schemaVersion` 用于协议升级。
- 未识别字段默认忽略。
- `x-*` 字段作为实验扩展字段。
- 新增结果类型时不破坏已有类型。
- `facadeContext` 只增不减。
