# 技术架构草案

## 1. 当前阶段

当前阶段继续澄清技术细节，暂不进入实现。

目标是先明确：

- Monorepo 工程结构。
- Runtime 与渲染器边界。
- Vue / React 兼容策略。
- Mock Server 方案。
- Mock Model Adapter 与真实模型 Adapter 的切换方式。
- Skill 装载与注册机制。

## 2. 技术栈初步判断

### 2.1 Monorepo

项目需要严格按照 Monorepo 设计。

Facade 自身是 Monorepo，但发布和使用时应以一个核心入口包为主。使用者只安装主包，其他内部包通过主包依赖一并安装。

Facade 仓库建议目录：

```text
ai-facade/
  packages/
    facade/
    core/
    runtime/
    workbench/
    schema-ui/
    vue-renderer/
    react-renderer/
    model-adapter/
    skill-loader/
    vite-plugin/
    mock-server/
  examples/
    vue-demo/
    react-demo/
  prd/
```

使用者安装：

```text
pnpm add @eff-facade/facade
```

其中 `@eff-facade/facade` 是唯一主入口包，内部依赖 `core`、`runtime`、`workbench`、`schema-ui`、renderer、model adapter、skill loader 等包。

宿主项目中的 Skill 不放在 Facade 仓库顶层，而是放在宿主项目源码中：

```text
host-project/
  src/
    skills/
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

这样可以让业务能力跟随宿主项目演进，同时 Facade 作为运行环境保持通用。

Skill 装载采用两级注册：

- 宿主项目 `src/skills/agent.json` 注册所有 Skill。
- 每个 Skill 内部 `mcp.json` 注册原子能力、原子组件和其他元信息。

Facade Adapter 注册 Skill 根目录，例如 `src/skills`。Facade 插件从 `agent.json` 发现 Skill，再读取对应 `mcp.json` 和 `skill.md` 生成运行时可消费的 Skill Registry。

### 2.2 Fastify

Mock Server 使用 Fastify。

理由：

- TypeScript 体验较好。
- 插件机制清晰。
- 性能与生态都足够。
- 适合后续模拟企业内部 API 网关。

### 2.3 模型 Adapter

第一版同时保留：

- Mock Model Adapter：默认启用，用于本地验证和稳定演示。
- Real Model Adapter：后续接真实大模型 API。

默认使用 Mock Model Adapter，避免 MVP 被模型不稳定性阻塞。

### 2.4 包管理

使用 `pnpm workspace`。

### 2.5 MVP Workbench 与 Renderer

Workbench 是 Facade 的核心内置应用，不属于 renderer adapter。

Workbench 负责：

- 会话主入口。
- 左侧工具栏。
- 中间消息流。
- 底部输入区。
- 右侧 Drawer。
- 任务历史。
- 调试面板。
- 设置面板。
- Runtime 状态展示。

Renderer adapter 只负责渲染 Skill 下行内容：

- `message`
- `form`
- `confirmation`
- `description`
- `table`
- `link-card`
- `component`
- `mixed`
- `error`

MVP 可以使用 Vue 3 实现 Workbench 内部 UI，但这是 Facade 内部实现细节，不应把 Workbench 归类为 Vue renderer 的一部分。

统一 Schema 协议和 Runtime 仍按多 renderer 适配设计，React renderer 后续扩展。

## 3. Vue / React 双兼容判断

### 3.1 结论

可以同时兼容 Vue 和 React，但不建议让业务 Skill 组件一开始就直接同时支持 Vue/React 两套源码。

更合理的路径是：

1. Facade Core、Runtime、Skill 协议、Schema UI 协议全部框架无关。
2. 标准 Schema UI 由不同 renderer 适配：
   - `vue-renderer`
   - `react-renderer`
3. 自定义组件优先走 Web Components 或远程组件适配层。
4. 如果业务方明确在 Vue 项目中开发 Skill，可以先支持 Vue SFC；React 项目再通过 React renderer 或 Web Component 消费标准输出。

### 3.2 成本评估

#### 低成本部分

以下部分天然可以跨 Vue / React：

- Skill 描述：`skill.md`
- Skill 注册：`mcp.json`
- 原子能力：`apis/xxx.ts`
- Schema 协议：`jsonSchema` + `uiSchema`
- Skill 命中与执行流程
- Mock Server
- Model Adapter

这些应放在框架无关包中。

#### 中等成本部分

标准 Schema UI 渲染需要分别实现 Vue 和 React renderer。

成本来源：

- 表单状态管理。
- 校验展示。
- 组件映射。
- 提交、取消、确认等事件模型。
- 样式一致性。

可通过共享核心逻辑降低成本：

- `schema-ui` 负责解析 Schema、生成渲染树、校验规则。
- `vue-renderer` 和 `react-renderer` 只负责框架层渲染。

#### 较高成本部分

自定义组件跨框架成本最高。

如果 Skill 组件直接写成 `components/xxx.vue`：

- Vue 项目中天然可用。
- React 项目无法直接消费 Vue SFC。
- 需要额外构建为 Web Component、iframe、远程模块，或要求 React 侧提供对应组件。

因此自定义组件需要有明确策略。

## 4. 自定义组件兼容策略

### 4.1 推荐路线

第一版建议：

- 标准能力尽量使用 Schema UI。
- 自定义组件支持 Vue SFC 作为 MVP 演示能力。
- 同时在协议层预留 `componentType`，为 Web Components 和 React 组件扩展。

例如：

```json
{
  "components": [
    {
      "id": "user_profile_card",
      "entry": "./components/UserProfileCard.vue",
      "componentType": "vue"
    }
  ]
}
```

后续可扩展：

```json
{
  "components": [
    {
      "id": "user_profile_card",
      "entry": "./dist/user-profile-card.js",
      "componentType": "web-component",
      "tagName": "ai-user-profile-card"
    }
  ]
}
```

### 4.2 Web Components 路径

Web Components 是 Vue / React 双兼容最稳妥的通用组件承载方式。

优势：

- 可被 Vue、React、原生 HTML 使用。
- 运行时边界清晰。
- 适合作为跨项目、跨框架的远程组件标准。

成本：

- 事件、属性、样式隔离需要规范。
- 表单类复杂交互要额外设计数据同步协议。
- 对业务开发者有一定学习成本。
- Vue SFC 需要构建为 Custom Element 后再分发。

### 4.3 推荐阶段策略

MVP：

- Workbench 先用 Vue 3 实现，但归属 `packages/workbench`。
- `vue-renderer` 只负责 Skill result 的 Vue 渲染适配。
- `schema-ui` 协议保持框架无关。
- 自定义组件先支持 Vue SFC。
- React 侧先通过标准 Schema UI 验证兼容。
- 内置 Vue 组件基于 `shadcn-vue`。

V1：

- 将 `packages/workbench` 输出为 Web Component 或 `mountEffFacadeWorkbench`。
- 宿主项目通过 dist JS/CSS 或 Custom Element 接入 Workbench。
- Vue 只是 Workbench 内部实现，不要求宿主项目感知 Workbench 框架。
- 标准 Skill result 渲染继续通过 renderer adapter 完成。

V2：

- 增加 `react-renderer`。
- 标准 Skill result UI 在 Vue/React 中保持一致。
- React 内置组件基于 `shadcn`。

V3：

- 自定义组件推荐发布为 Web Components。
- 支持跨项目远程组件加载。

## 5. 包职责建议

### 5.1 `packages/facade`

NPM 主入口包。

职责：

- 对外暴露安装和初始化 API。
- 聚合内部依赖。
- 提供默认 Workbench。
- 提供默认 Adapter。
- 提供默认 renderer 入口。
- 屏蔽内部包安装细节。
- 运行时代码从主入口导出。
- 构建插件从子路径 `@eff-facade/facade/vite` 导出，避免 Node 配置阶段加载浏览器 UI。

使用者原则上只需要安装该包。

### 5.2 `packages/core`

框架无关核心类型与协议：

- Skill 类型。
- Runtime 上下文类型。
- Adapter 类型。
- Schema UI 类型。
- 结果协议。

### 5.3 `packages/runtime`

框架无关运行时：

- Skill 注册。
- Skill 命中。
- 原子能力调用。
- 消息下行。
- Workbench 状态机。

### 5.4 `packages/schema-ui`

框架无关 Schema UI 解析层：

- `jsonSchema` 解析。
- `uiSchema` 解析。
- 渲染树生成。
- 基础校验。
- 扩展位定义。

### 5.5 `packages/workbench`

Facade 内置 Workbench。

职责：

- 提供公司级 AI 会话工作台。
- 组织 Runtime 状态、消息、任务历史和调试信息。
- 承载输入区、工具栏、Drawer、设置面板等核心壳能力。
- 调用 Skill result renderer 渲染消息中的结构化内容。
- MVP 内部可以使用 Vue 3 实现。
- 后续输出 Web Component / mount API，让宿主框架无关接入。

非职责：

- 不承载业务 Skill 自定义组件协议。
- 不负责模型识别和原子能力执行。
- 不直接依赖宿主项目业务组件库。

### 5.6 `packages/vue-renderer`

Vue 渲染适配：

- Skill result Vue 组件。
- Schema UI Vue 表单组件。
- 确认、描述、表格、链接、混合内容等消息块渲染。
- Vue 自定义组件加载。
- MVP 基于 `shadcn-vue` 实现内置基础组件。

### 5.7 `packages/react-renderer`

React 渲染适配：

- Skill result React 组件。
- Schema UI React 表单组件。
- React 自定义组件加载。
- 后续基于 `shadcn` 实现内置基础组件。

### 5.8 Web Component 输出

Web Component 是 Workbench 的后续输出形态，不是当前 MVP 的独立 renderer 包。

目标：

- 输出 `<eff-facade-workbench>` 或 `mountEffFacadeWorkbench(el, options)`。
- 宿主 React/Vue/原生项目无需理解 Workbench 内部技术栈。
- Workbench 内部仍可使用 Vue 3 编写和构建。
- Skill 自定义组件和标准 Schema UI 仍通过 renderer adapter 处理。

### 5.9 `packages/mock-server`

Fastify Mock Server：

- 字典接口。
- SKU 接口。
- 用户查询接口。
- 知识库链接接口。

### 5.10 `packages/vite-plugin`

Vite 构建插件：

- 读取宿主项目 `src/skills/agent.json`。
- 解析每个 Skill 的 `mcp.json`。
- 读取 `skill.md`。
- 为原子能力和原子组件生成 import。
- 暴露虚拟模块给 Runtime 使用。

### 5.11 示例 Skill

示例 Skill 不作为 Facade 的主要目录模型，而是放在 example 宿主项目的 `src/skills` 下，用于模拟真实业务项目接入：

- 字典 Skill。
- SKU Skill。
- 知识库 Skill。
- 用户查询 Skill。

## 6. 关键原则

- 业务协议优先于框架实现。
- Workbench 是 Facade 核心应用，不属于 renderer adapter。
- Renderer adapter 只渲染 Skill 下行内容。
- 默认用 Schema UI 承载通用能力。
- 自定义组件作为增强能力，而不是第一选择。
- Facade Runtime 不依赖 Vue 或 React。
- Workbench 内部实现可以选择一个技术栈，但对宿主项目应逐步走向 Web Component / mount API。
- 渲染器可以有多个，但 Skill 协议尽量只有一套。
- Mock Model Adapter 默认启用，真实模型通过 Adapter 切换。
- Skill 自定义组件由宿主项目环境编译，因此可以使用宿主项目已安装的组件库。

Skill 装载机制详见 [skill-loading.md](./skill-loading.md)。
