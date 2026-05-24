# Stage 7 协议对齐清单

## 1. 目标

Stage 7 的目标是把 MVP 已经验证的实现路径收束为稳定的 v0.1 协议和开发者体验。

核心问题：

> 业务开发者是否可以按照文档创建一个真实 Skill，并在宿主项目中稳定运行？

## 2. 已实现并对齐

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| 单宿主 `agent.json` | 已实现 | 默认位置 `src/skills/agent.json` |
| Skill 级 `mcp.json` | 已实现 | 注册原子能力和原子组件 |
| `skill.md` 召回信息 | 已实现 | 当前用于轻量候选召回 |
| Vite 插件装载 | 已实现 | 生成 `virtual:eff-facade/skills` |
| 原子能力调用 | 已实现 | 浏览器端执行，MVP 调用 Mock Server |
| 自定义 Vue 组件 | 已实现 | 由宿主项目编译并动态加载 |
| Mock Model Adapter | 已实现 | 支持 Skill judge 和普通问答 fallback |
| Workbench | 已实现 | 左侧工具栏、中间会话、右侧 Drawer |
| 任务历史与调试面板 | 已实现 | 支持任务状态和 Trace 摘要 |
| 标准 result 类型 | 已实现 | `message`、`form`、`confirmation`、`description`、`table`、`link-card`、`component`、`mixed`、`error` |

## 3. 已定义但需要继续补齐

| 能力 | 当前状态 | 后续阶段 |
| --- | --- | --- |
| `checkbox` 字段组件 | 协议已定义，未实现 | Stage 8 |
| `date` 字段组件 | 协议已定义，未实现 | Stage 8 |
| 更完整表单校验展示 | 基础 required 已实现 | Stage 8 |
| 二次确认卡片细化 | 基础可用 | Stage 8 |
| Skill 开发者完整文档 | 部分已有 | Stage 7 |
| demo Skill 规范化说明 | 部分已有 | Stage 7 |

## 4. 协议预留

| 能力 | 说明 |
| --- | --- |
| Real Model Adapter | P3 实现 |
| React renderer | P4 实现 |
| Web Components | P4 作为跨框架策略验证 |
| Server-side Executor | P5 公司级治理阶段 |
| SSO / 权限 / 审计 / 脱敏 | P5 公司级治理阶段 |
| 多项目 Skill 聚合 | P6 统一平台阶段 |
| 字段联动 / 异步选项 / 动态数组 / 分步骤表单 | Schema UI 后续扩展 |

## 5. 当前明确不做

- 不把普通问答抽象成业务 Skill。
- 不支持多轮上下文。
- 不支持多个 `agent.json`。
- 不要求 Skill 自定义组件跨框架运行。
- 不在 Facade runtime 中内置业务 API 逻辑。
- 不把 Workbench 做成完整业务系统页面。

## 6. 本轮已修正事项

- `protocol-v0.1.md` 增加 `skill.md` 正式章节。
- `protocol-v0.1.md` 增加 v0.1 支持矩阵。
- `protocol-v0.1.md` 明确表单字段协议和当前实现状态。
- `dictionary-skill/mcp.json` 的 `renderType` 从 `confirmation` 修正为 `mixed`。
- `schema-ui-runtime.md` 的 MVP 示例对应关系已对齐当前 demo。
- `packages/core` 增加 `BuiltInUiFieldComponent` 与 `helpText` 类型。
- `packages/schema-ui` 与 `packages/vue-renderer` 支持透传并展示 `helpText`。
