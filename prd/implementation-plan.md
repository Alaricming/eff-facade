# 实施计划

## 1. 执行原则

实施过程中按阶段推进，每个关键阶段完成后暂停，与产品/技术负责人确认后再进入下一阶段。

原则：

- 先工程骨架，后业务闭环。
- 先协议和装载，后 UI 细节。
- 先 Mock，后真实模型。
- 先 Vue 3 Demo，后 React / Web Components。
- 每阶段都有可验证结果。

## 2. 阶段划分

当前实施计划覆盖：

- Stage 0：工程初始化。
- Stage 1：协议与核心类型。
- Stage 2：Skill 装载与 Vite 插件。
- Stage 3：Runtime 最小链路。
- Stage 4：Vue Workbench 基础 UI。
- Stage 5：Mock Server 与示例 Skill。
- Stage 6：MVP 闭环联调。
- Stage 7：协议与开发者体验收束。
- Stage 8：Schema UI MVP 补齐。
- Stage 9：Workbench 架构归位。
- Stage 10：Workbench Web Component 输出。

当前项目已经进入 Stage 8 后半段。根据架构复盘，Workbench 不应继续归属于 `vue-renderer`，需要在 Stage 9 中迁移为 Facade 内置核心应用，再在 Stage 10 中输出 Web Component / mount API。

## 3. Stage 0：工程初始化

目标：创建 monorepo 基础结构。

任务：

- 初始化根 `package.json`。
- 初始化 `pnpm-workspace.yaml`。
- 初始化基础 `tsconfig`。
- 创建 `packages` 目录。
- 创建 `examples/vue-demo`。
- 创建必要包目录：
  - `packages/facade`
  - `packages/core`
  - `packages/runtime`
  - `packages/schema-ui`
  - `packages/vue-renderer`
  - `packages/model-adapter`
  - `packages/skill-loader`
  - `packages/vite-plugin`
  - `packages/mock-server`

交付物：

- monorepo 能被 pnpm 识别。
- 基础包目录存在。
- 暂不实现业务逻辑。

验证方式：

- `pnpm install` 可执行。
- `pnpm -r --filter` 能识别 workspace 包。

暂停确认点：

- 确认目录结构和包命名是否符合预期。

## 4. Stage 1：协议与核心类型

目标：将协议 v0.1 转化为 TypeScript 类型。

任务：

- 在 `packages/core` 中定义：
  - `AgentManifest`
  - `SkillManifest`
  - `AtomicAbility`
  - `AtomicAbilityInput`
  - `AtomicAbilityResult`
  - `FacadeContext`
  - Adapter 基础类型
- 导出协议常量。
- 在 `packages/facade` 中 re-export 核心类型。

交付物：

- 可被其他包引用的协议类型。
- 类型命名与 PRD 保持一致。

验证方式：

- TypeScript 编译通过。
- 示例类型引用通过。

暂停确认点：

- 确认协议类型是否符合 v0.1 设计。

## 5. Stage 2：Skill 装载与 Vite 插件

目标：让宿主项目的 `src/skills/agent.json` 能被发现并转换为运行时 registry。

任务：

- 在 `packages/vite-plugin` 中实现插件骨架。
- 支持配置 `skillRoot`。
- 读取 `agent.json`。
- 读取每个 Skill 的 `mcp.json`。
- 读取 `skill.md`。
- 根据 `abilities[].entry` 生成原子能力 import。
- 根据 `components[].entry` 生成组件 import。
- 生成虚拟模块：`virtual:eff-facade/skills`。
- 在 `packages/skill-loader` 中消费 registry。

交付物：

- Vite 插件能输出 Skill Registry。
- Skill Registry 包含：
  - agent 信息
  - skill 信息
  - skillDoc 文本
  - 原子能力 loader
  - 原子组件 loader

验证方式：

- 在 Vue Demo 中创建最小 `src/skills/agent.json`。
- 插件能发现并生成虚拟模块。

暂停确认点：

- 确认 `agent.json -> mcp.json -> registry` 链路符合预期。

## 6. Stage 3：Runtime 最小链路

目标：跑通 `user input -> skill recall -> mock model judge -> atomic ability run -> result`。

任务：

- 在 `packages/runtime` 中实现基础 Runtime。
- 实现消息状态管理。
- 实现任务历史记录。
- 实现调试信息收集。
- 实现简单 Skill recall。
- 接入 Mock Model Adapter。
- 实现原子能力调用。
- 支持 `message` / `error` 结果下行。

交付物：

- 不依赖 UI 的 runtime 可以处理一次输入。
- 能调用示例原子能力并返回结果。

验证方式：

- 使用简单脚本或 Vue Demo 调用 Runtime。
- 输入固定文本能命中 mock ability。

暂停确认点：

- 确认 Runtime 链路和调试信息结构符合预期。

## 7. Stage 4：Vue Workbench 基础 UI

目标：实现 Vue 3 Workbench 基础交互。

任务：

- 在 `packages/vue-renderer` 中实现：
  - Workbench Shell
  - 左侧 icon 工具栏
  - 中间会话流
  - 输入区
  - 右侧 Drawer
  - 任务历史视图
  - 调试面板
- 实现基础消息渲染：
  - 用户消息
  - AI 文本消息
  - 错误消息
  - 运行中消息

交付物：

- Vue Demo 中能看到完整 Workbench 框架。
- 可以输入文本并看到消息流。

验证方式：

- 启动 Vue Demo。
- 手动输入文本，消息显示正常。
- Drawer 可打开，历史和调试面板可查看。

暂停确认点：

- 确认 Workbench 布局、交互和视觉方向是否符合预期。

## 8. Stage 5：Mock Server 与示例 Skill

目标：补齐四个 MVP 业务场景。

任务：

- 在 `packages/mock-server` 中实现 Fastify 服务：
  - `POST /api/dictionaries`
  - `POST /api/skus`
  - `GET /api/users/:id`
  - `GET /api/knowledge-base/link`
- 在 `examples/vue-demo/src/skills` 中实现：
  - `dictionary-skill`
  - `sku-skill`
  - `knowledge-base-skill`
  - `user-query-skill`
- 实现对应 `agent.json`、`mcp.json`、`skill.md`、`apis`、`components`。

交付物：

- 四个示例 Skill 都能被装载。
- 原子能力能调用 Mock Server。

验证方式：

- Mock Server 可启动。
- 手动调用接口成功。
- Vue Demo 中能触发四个 Skill。

暂停确认点：

- 确认四个示例场景是否覆盖 MVP 验证目标。

## 9. Stage 6：MVP 闭环联调

目标：让用户能在 Vue Demo 中完整体验 AI Facade。

任务：

- 实现 Schema UI 渲染：
  - `confirmation`
  - `form`
  - `description`
  - `table`
  - `link-card`
  - `component`
  - `mixed`
- 实现表单提交和确认交互。
- 实现普通问答 fallback。
- 完善任务历史。
- 完善调试面板。
- 修正错误提示。

交付物：

- Vue Demo 中可完成：
  - 创建字典。
  - 创建 SKU。
  - 创建知识库跳转。
  - 查询用户信息。
  - 普通问答。

验证方式：

- 手动执行 MVP 验证场景。
- 检查任务历史。
- 检查调试面板。
- 检查 UI 是否符合视觉方向。

暂停确认点：

- 确认 MVP 是否达到演示和继续迭代标准。

## 10. 暂不进入的内容

- React renderer。
- React Demo。
- Workbench Web Component 完整输出。
- Real Model Adapter 实现。
- Server-side Executor。
- SSO。
- 权限。
- 审计。
- 字段脱敏。
- 多轮上下文。

## 11. Stage 7：协议与开发者体验收束

目标：把 MVP 已经验证的能力固化为可复用协议和开发者工作流。

任务：

- 回写并收束 `protocol-v0.1.md`：
  - `agent.json`。
  - `mcp.json`。
  - `skill.md`。
  - 原子能力输入。
  - 原子能力输出。
  - 标准 result 类型。
  - 自定义组件注册。
- 对齐核心类型：
  - 检查 `packages/core` 与协议文档是否一致。
  - 明确 MVP 支持字段和预留字段。
- 整理 Skill 开发者文档：
  - `src/skills` 目录规范。
  - `agent.json` 示例。
  - `skill.md` 示例。
  - `mcp.json` 示例。
  - `apis/*.ts` 示例。
  - `components/*.vue` 示例。
- 校准工具 Skill：
  - `.codex/skills/eff-facade-skill-creator`。
  - `.claude/skills/eff-facade-skill-creator`。
  - 确保它们服务于业务 Skill 创建，而不是 runtime 代码适配。
- 对齐 demo Skills：
  - `dictionary-skill`。
  - `business-skill`。
  - 确保示例代码可以作为业务方参考。
- 补充 MVP 验收清单：
  - 普通问答。
  - 创建字典。
  - 创建 SKU。
  - 创建知识库跳转。
  - 查询用户信息。
  - 任务历史。
  - 调试面板。

交付物：

- 协议文档可作为实现依据。
- 开发者文档可指导创建新 Skill。
- 示例 Skill 与规范一致。
- 当前实现与文档之间的差异列表。
- MVP 验收流程沉淀到 [mvp-acceptance-checklist.md](./mvp-acceptance-checklist.md)。

验证方式：

- 用现有 Vue Demo 验证两类示例 Skill。
- 按文档检查 `agent.json`、`mcp.json`、`skill.md`。
- 按 MVP 验收清单验证五个核心场景。
- 运行 typecheck/build。

暂停确认点：

- 确认协议 v0.1 是否可以作为下一阶段实现边界。
- 确认业务开发者文档是否足够清晰。

## 12. Stage 8：Schema UI MVP 补齐

目标：补齐生成式 UI 在真实业务 Skill 中最常用的字段能力。

任务：

- 支持并验证字段组件：
  - `input`。
  - `textarea`。
  - `select`。
  - `radio`。
  - `switch`。
  - `number`。
  - `checkbox`。
  - `date`。
- 支持字段属性：
  - `placeholder`。
  - `description/helpText`。
  - `hidden`。
  - `disabled`。
  - `default`。
  - `required`。
- 优化表单校验展示。
- 优化二次确认卡片视觉和交互。
- 记录但不实现复杂联动：
  - 异步选项。
  - 字段联动。
  - 动态数组。
  - 分步骤表单。

交付物：

- Schema UI 文档与实现一致。
- Vue renderer 能渲染 MVP 字段类型。
- 示例 Skill 覆盖主要字段能力。

验证方式：

- 创建或扩展示例 Skill 表单。
- 手动验证字段渲染、校验、提交。
- 运行 typecheck/build。

暂停确认点：

- 确认 Schema UI MVP 是否满足第一批业务 Skill 编写需要。

## 13. Stage 9：Workbench 架构归位

目标：纠正 Workbench 与 renderer 的职责边界。

背景：

- Workbench 是 Facade 的核心内置应用。
- Workbench 负责会话、任务历史、调试面板、设置面板、输入区和整体工作台框架。
- Renderer adapter 只负责 Skill 下行内容的渲染，例如表单、确认卡片、描述、表格、链接卡片、自定义组件和 mixed blocks。

任务：

- 新增 `packages/workbench`。
- 将 Workbench shell 从 `packages/vue-renderer` 迁移到 `packages/workbench`：
  - `EffFacadeWorkbench.vue`
  - `EffWorkbenchDrawer.vue`
  - Workbench 相关 tokens。
- 保留 `packages/vue-renderer` 中的 Skill result 渲染能力：
  - `EffResultCard.vue`
  - `EffSchemaForm.vue`
  - `EffDynamicComponent.vue`
- 调整包依赖：
  - `workbench` 依赖 `core`、`runtime`、`vue-renderer`。
  - `facade` 依赖并导出 `workbench`。
  - `vue-renderer` 不再导出 Workbench shell。
- 调整 Vue Demo 引用，确保现有 MVP 场景不受影响。
- 更新相关文档：
  - [technical-architecture.md](./technical-architecture.md)
  - [host-integration-guide.md](./host-integration-guide.md)
  - [visual-and-components.md](./visual-and-components.md)

交付物：

- Workbench shell 已归属 `packages/workbench`。
- Vue renderer 只承担 Skill result 渲染职责。
- Vue Demo 仍可运行现有五个核心场景。

验证方式：

- `pnpm --filter @eff-facade/workbench typecheck && pnpm --filter @eff-facade/workbench build`
- `pnpm --filter @eff-facade/vue-renderer typecheck && pnpm --filter @eff-facade/vue-renderer build`
- `pnpm --filter @eff-facade/facade typecheck && pnpm --filter @eff-facade/facade build`
- `pnpm --filter @eff-facade/vue-demo validate:skills && pnpm --filter @eff-facade/vue-demo build`
- 浏览器验证 Workbench 仍能完成已有 MVP 场景。

暂停确认点：

- 确认包边界是否已经符合“Workbench 是核心应用，renderer 只渲染 Skill 内容”的定位。

## 14. Stage 10：Workbench Web Component 输出

目标：让宿主项目以框架无关方式接入 Facade Workbench。

任务：

- 在 `packages/workbench` 内设计 Web Component 或 mount API：
  - `<eff-facade-workbench>`
  - 或 `mountEffFacadeWorkbench(el, options)`
- 输出 dist JS/CSS。
- 明确 options 输入：
  - runtime
  - registry
  - adapters
  - initialPrompt
  - title
  - examplePrompts
  - theme tokens
- 明确事件输出：
  - route open
  - task status change
  - error
  - debug trace
- 明确样式隔离策略：
  - Shadow DOM 或 scoped class。
  - Tailwind 产物如何注入。
- 保留 Vue Demo，同时增加一个原生 HTML 或 React Host Demo 验证框架无关接入。

交付物：

- 宿主项目可以不直接使用 Vue 组件，而是挂载 Facade Workbench dist。
- Workbench 内部技术栈不暴露给宿主项目。

验证方式：

- 原生 HTML Demo 可挂载 Workbench。
- Vue Demo 可继续使用。
- Skill result 渲染和自定义组件加载策略不被破坏。

暂停确认点：

- 确认 Web Component 输出是否可以作为 V1 对外集成形态。
