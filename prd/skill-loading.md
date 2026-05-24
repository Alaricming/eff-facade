# Skill 装载与注册机制

## 1. 目标

Skill 装载机制负责让 Facade 在宿主项目中发现 Skill，并加载每个 Skill 中注册的原子能力、原子组件和描述信息。

第一版采用两级注册：

1. `src/skills/agent.json`：注册当前宿主项目提供哪些 Skill。一个宿主项目只支持一个 `agent.json`。
2. `src/skills/{skill}/mcp.json`：注册某个 Skill 内部的原子能力、原子组件和其他元信息。

## 2. 宿主项目目录

```text
host-project/
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
      sku-skill/
        skill.md
        mcp.json
        apis/
          create-sku.ts
        components/
          SkuCreateForm.vue
```

宿主项目通过 Facade Adapter 注册 Skill 根目录：

```ts
createAIFacade({
  skillRoot: 'src/skills'
})
```

Facade 从 `src/skills/agent.json` 开始发现 Skill。

## 3. `agent.json`

`agent.json` 用于注册当前宿主项目暴露给 Facade 的 Skill。

一个宿主项目只支持一个 `agent.json`，其中包含多个 Skill。

示例：

```json
{
  "id": "wms-agent",
  "name": "WMS Agent",
  "version": "0.1.0",
  "skills": [
    {
      "id": "dictionary-skill",
      "path": "./dictionary-skill",
      "enabled": true
    },
    {
      "id": "sku-skill",
      "path": "./sku-skill",
      "enabled": true
    }
  ]
}
```

职责：

- 声明当前宿主项目有哪些 Skill。
- 控制 Skill 是否启用。
- 为后续 Skill 分组、版本、灰度预留空间。

## 4. `mcp.json`

`mcp.json` 用于注册某个 Skill 内部所有内容。

包括：

- Skill 基础信息。
- 原子能力。
- 原子组件。
- 默认渲染策略。
- 风险等级。
- 未来扩展信息。

示例：

```json
{
  "id": "dictionary-skill",
  "name": "字典管理 Skill",
  "version": "0.1.0",
  "skillDoc": "./skill.md",
  "abilities": [
    {
      "id": "create_dictionary",
      "title": "创建字典",
      "entry": "./apis/create-dictionary.ts",
      "renderType": "confirmation"
    }
  ],
  "components": [
    {
      "id": "dictionary_preview",
      "entry": "./components/DictionaryPreview.vue",
      "componentType": "vue"
    }
  ]
}
```

## 5. `skill.md` 读取方式评估

### 5.1 方案 A：Vite raw import

例如：

```ts
import skillDoc from './skill.md?raw'
```

优点：

- 实现简单。
- 对 Vite 项目友好。
- 不需要额外构建插件。
- MVP 速度最快。

缺点：

- 和构建工具绑定较强。
- 如果宿主项目不是 Vite，需要额外适配。
- `mcp.json` 里写路径并不能直接在浏览器运行时读文件，仍需要构建期 import。

### 5.2 方案 B：Facade 构建插件统一处理

插件读取 `agent.json`、`mcp.json`、`skill.md`，生成可被浏览器直接使用的 Skill Registry。

优点：

- 对宿主项目使用者更省心。
- 统一处理路径解析、raw md、动态 import、组件注册。
- 更符合低侵入目标。
- 后续更容易支持 Vite、Webpack、Rspack 等不同构建工具。

缺点：

- Facade 自身需要维护构建插件。
- MVP 实现复杂度更高。
- 不同构建工具需要分别适配。

### 5.3 当前建议

从减少宿主项目入侵性和减少用户操作角度，长期更适合方案 B：Facade 构建插件统一处理。

但 MVP 可以采用折中方案：

- 协议上按 `agent.json` + `mcp.json` 设计。
- 实现上先提供 Vite 插件。
- 插件自动读取 `src/skills/agent.json`，解析每个 Skill 的 `mcp.json` 和 `skill.md`。
- 插件生成虚拟模块，例如 `virtual:ai-facade/skills`。
- Runtime 只消费生成后的 Skill Registry。

这样宿主项目只需要：

1. 编写 `src/skills/agent.json`。
2. 编写各 Skill 的 `mcp.json`、`skill.md`、`apis`、`components`。
3. 在 Vite 配置中启用 Facade 插件。

## 6. `agent.json` 与静态 import 的关系

`agent.json` 和静态 import 不是同一层。

`agent.json` 是产品协议，声明有哪些 Skill。

静态 import 是构建实现手段，用于让 bundler 能正确打包：

- `skill.md`
- `mcp.json`
- `apis/*.ts`
- `components/*.vue`

浏览器运行时不能直接根据字符串路径读取源码文件，因此需要构建期把 `agent.json` 和 `mcp.json` 转换成真实 import。

## 7. 原子能力执行位置

MVP：

- 原子能力在浏览器端执行。
- 原子能力调用 Fastify Mock Server。

后续待办：

- 支持公司级 Server-side Executor。
- 原子能力可选择在服务端运行。
- 服务端统一处理鉴权、审计、敏感数据和跨系统调用。

该能力记录到治理与架构待办中。

## 8. 自定义组件注册方式评估

### 8.1 方案 A：显式 import 注册

宿主项目写代码：

```ts
import DictionaryPreview from './skills/dictionary-skill/components/DictionaryPreview.vue'

registerSkillComponent('dictionary_preview', DictionaryPreview)
```

优点：

- 最直观。
- 构建稳定。
- 类型提示较好。
- 调试容易。

缺点：

- 对宿主项目入侵更高。
- 每加一个组件都要改注册代码。
- `mcp.json` 的组件声明和真实注册容易不一致。

复杂度：低。

### 8.2 方案 B：通过 `mcp.json` entry 动态加载

`mcp.json` 中声明：

```json
{
  "components": [
    {
      "id": "dictionary_preview",
      "entry": "./components/DictionaryPreview.vue",
      "componentType": "vue"
    }
  ]
}
```

构建插件读取 entry，并生成动态 import：

```ts
const componentLoaders = {
  dictionary_preview: () => import('./skills/dictionary-skill/components/DictionaryPreview.vue')
}
```

优点：

- 对宿主项目更低侵入。
- `mcp.json` 成为唯一注册来源。
- 更适合大量 Skill 和组件。
- 更符合未来跨项目聚合。

缺点：

- 需要构建插件支持。
- 路径解析、懒加载、错误提示要做规范。
- 不同构建工具需要适配。

复杂度：中等。

### 8.3 当前建议

MVP 建议采用方案 B，但只先实现 Vite 插件路径。

理由：

- 更符合低侵入目标。
- 与 `agent.json` / `mcp.json` 两级注册模型一致。
- 以后扩展到远程组件或 Web Components 更自然。

## 9. 推荐装载链路

```text
host registers skillRoot
  -> facade plugin reads skillRoot/agent.json
  -> plugin resolves each skill path
  -> plugin reads skill/mcp.json
  -> plugin reads skill/skill.md
  -> plugin generates imports for apis and components
  -> plugin exposes virtual skill registry
  -> runtime consumes virtual skill registry
```

协议字段详见 [protocol-v0.1.md](./protocol-v0.1.md)。
