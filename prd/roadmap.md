# Roadmap 里程碑

## 1. 目标

Roadmap 用于明确 AI Facade 从 MVP 到公司级平台的演进路径。

基本原则：

- 先跑通闭环，再追求完整平台能力。
- 先用 Mock 保证验证效率，再接真实模型和公司级服务。
- 先支持 Vue 3 Demo，再扩展 React / Web Components。
- 先以宿主项目 `src/skills` 接入，再考虑跨项目聚合。

## 1.1 当前重心调整

P0/P1 的工程骨架、Vue Demo、Mock Server、Workbench、基础 Skill 闭环已经进入可演示状态。接下来不继续把主要投入放在 Workbench 视觉细节，而是进入“协议与开发者体验收束”阶段。

这一阶段的核心问题是：

> 一个业务开发者拿到 AI Facade 后，能不能按标准低成本写出一个真实业务 Skill，并在宿主项目中稳定运行？

因此，P2 前置一个 P1.5 阶段，用于沉淀已经验证过的实现经验，避免后续迭代变成临时功能堆叠。

## 2. P0：协议与工程骨架

目标：建立可实现的工程基础。

交付内容：

- `pnpm workspace` monorepo。
- `@eff-facade/facade` 主包。
- 核心协议类型。
- `agent.json` / `mcp.json` v0.1 类型。
- 原子能力类型。
- 原子能力返回结果类型。
- `facadeContext` 类型。
- Vite 插件骨架。
- Runtime 基础状态模型。

完成标准：

- 工程可以安装依赖、构建基础包。
- 协议类型可以被示例 Skill 引用。
- Vite 插件能发现 `src/skills/agent.json`。

## 3. P1：MVP Vue Demo 闭环

目标：跑通完整业务验证链路。

交付内容：

- Vue 3 Demo。
- Workbench 基础布局。
- 左侧工具栏。
- 中间会话流。
- 右侧 Drawer。
- Mock Model Adapter。
- Skill recall。
- Model judge Mock。
- 原子能力调用。
- Fastify Mock Server。
- Schema UI 基础渲染。
- 任务历史。
- 调试面板。

示例 Skill：

- 创建字典。
- 创建 SKU。
- 创建知识库跳转。
- 查询用户信息。
- 普通问答 fallback。

完成标准：

- 用户可以在 Vue Demo 中输入四类业务指令。
- Runtime 能命中对应 Skill。
- 原子能力能被调用。
- 结果能以消息卡片展示。
- 表单、确认卡片、查询结果、跳转链接均可用。
- 任务历史和调试面板能展示关键链路信息。

## 4. P1.5：协议与开发者体验收束

目标：把 P1 验证出的实现路径固化为可复用的协议、规范和开发者体验。

交付内容：

- 收束 `protocol-v0.1`：
  - `agent.json` 职责。
  - `mcp.json` 职责。
  - `skill.md` 命中信息职责。
  - 原子能力输入输出协议。
  - 原子组件注册协议。
  - 标准 result 类型边界。
- 补齐 Schema UI MVP：
  - `input`
  - `textarea`
  - `select`
  - `radio`
  - `switch`
  - `number`
  - `checkbox`
  - `date`
  - `description/helpText`
  - `hidden/disabled`
  - required 校验展示。
- 整理业务 Skill 开发者文档：
  - 如何创建 `src/skills/agent.json`。
  - 如何创建 Skill 目录。
  - 如何编写 `skill.md`。
  - 如何编写 `mcp.json`。
  - 如何编写 `apis/*.ts` 原子能力。
  - 如何编写 `components/*.vue` 自定义组件。
  - 如何本地验证。
- 对齐 demo Skills：
  - 检查 `dictionary-skill`。
  - 检查 `business-skill`。
  - 确保示例即规范。
- 补充 MVP 验收清单：
  - 普通问答。
  - 创建字典。
  - 创建 SKU。
  - 创建知识库跳转。
  - 查询用户信息。
  - 任务历史。
  - 调试面板。

完成标准：

- 协议文档和核心类型无明显冲突。
- 示例 Skill 能作为业务方参考模板。
- 一个新业务 Skill 可以按照文档创建并被 Vue Demo 装载。
- Workbench 支持调试这个新 Skill 的主要链路。

阶段边界：

- 不新增复杂 Workbench 功能。
- 不接真实模型。
- 不做 React renderer。
- 不做跨项目 Skill 聚合。
- 不做公司级治理能力。

## 5. P2：NPM 包接入体验

目标：让 Facade 具备被宿主项目低成本接入的能力。

交付内容：

- 主包导出稳定 API。
- Vite 插件可配置。
- Skill Root 可配置。
- Mock Model Adapter / Real Model Adapter 接口切换。
- 文档化接入步骤。
- 错误提示优化。
- 基础样式隔离。
- Vue renderer 可作为包能力使用。

完成标准：

- 一个新的 Vue 3 宿主项目可以安装 `@eff-facade/facade`。
- 配置 Vite 插件后可读取 `src/skills/agent.json`。
- 宿主项目可编写自己的 Skill。
- 宿主项目 Skill 自定义组件可使用宿主已安装组件库。

## 6. P3：真实模型与能力增强

目标：从 Mock 验证走向真实 AI 能力。

交付内容：

- Real Model Adapter。
- Skill 候选召回优化。
- 真实模型意图判断。
- 参数提取。
- 普通问答真实模型 fallback。
- 流式消息。
- 更完善的错误处理。
- 更丰富的 Schema UI 组件。

完成标准：

- 可切换 Mock / Real Model。
- 真实模型能在候选 Skill 中做稳定判断。
- 参数提取结果可进入原子能力。
- 普通问答可用真实模型回答。

## 7. P4：多框架适配

目标：验证统一 Schema + 多 renderer 的架构成立。

交付内容：

- React renderer。
- React Demo。
- 标准 Schema UI 在 Vue / React 中一致。
- 自定义组件跨框架策略验证。
- Web Components 原型。

完成标准：

- 相同 Skill 和 Schema 输出可以在 Vue / React 中渲染。
- React 宿主项目可以接入 Facade。
- Web Components 方案能承载至少一个自定义组件。

## 8. P5：公司级治理能力

目标：具备公司内部生产环境上线基础。

交付内容：

- SSO Adapter。
- Permission Adapter。
- 字段脱敏。
- 审计日志。
- 风险分级。
- Server-side Executor。
- 真实业务系统 API 接入。
- 操作确认策略。
- 监控和告警。

完成标准：

- Skill 可按用户权限显示和执行。
- 写操作有审计记录。
- 敏感字段可脱敏。
- 原子能力可在服务端执行。
- 具备生产环境问题追踪能力。

## 9. P6：跨项目融合

目标：从单宿主项目接入走向多项目 Skill 聚合。

交付内容：

- 多项目 Skill Registry。
- Skill Manifest 发布机制。
- 跨项目 Skill 版本管理。
- 远程组件加载策略。
- Skill 健康检查。
- Skill 下线和告警。
- 统一平台运行态。

完成标准：

- 多个业务项目可以独立开发 Skill。
- 统一平台可以发现和运行多个项目的 Skill。
- Skill 变更、失效、下线有可观测能力。

## 10. 阶段优先级

MVP 必须完成：

- P0。
- P1。

短期重点：

- P2。
- P3。

中期重点：

- P4。
- P5。

远期规划：

- P6。

## 11. 风险提示

### 10.1 Skill 装载复杂度

构建插件需要处理路径、动态 import、raw markdown 和组件加载，是 MVP 的关键技术风险。

### 10.2 自定义组件跨框架

Vue SFC 无法直接在 React 中运行，后续需要 Web Components 或远程组件策略。

### 10.3 模型稳定性

真实模型的 Skill 命中、参数提取和可控性需要持续调优。

### 10.4 公司级治理

权限、审计、脱敏、SSO 不在 MVP，但进入真实公司场景前必须补齐。
