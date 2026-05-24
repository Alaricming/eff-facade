# MVP 实现拆解

## 1. MVP 范围

MVP 只实现 Vue 3 Demo。

架构仍按统一 Schema + 多 renderer 适配设计：

- Schema 协议统一。
- Runtime 框架无关。
- Vue 3 是第一套 renderer。
- React renderer 后续扩展。

## 2. 包管理

使用 `pnpm workspace`。

## 3. 主包命名

Facade 主入口包暂定：

```text
@eff-facade/facade
```

使用者安装时只需要安装主包：

```text
pnpm add @eff-facade/facade
```

其他内部包作为主包依赖被安装。

## 4. 建议 Monorepo 结构

```text
ai-facade/
  packages/
    facade/
    core/
    runtime/
    schema-ui/
    vue-renderer/
    react-renderer/
    web-component-renderer/
    model-adapter/
    skill-loader/
    vite-plugin/
    mock-server/
  examples/
    vue-demo/
  prd/
```

MVP 可以只实现必要包，但目录和边界按长期结构预留。

## 5. 包职责

### 5.1 `packages/facade`

主入口包。

职责：

- 对外提供初始化 API。
- 聚合 Runtime、Vue renderer、Model Adapter、Skill Loader 等能力。
- re-export 必要类型和工具。
- 根据实际代码设计决定是否 re-export Vite 插件。

### 5.2 `packages/core`

协议与类型：

- `agent.json` 类型。
- `mcp.json` 类型。
- 原子能力类型。
- `facadeContext` 类型。
- 结果协议类型。
- Adapter 类型。

### 5.3 `packages/runtime`

运行时：

- 消息状态管理。
- Skill recall。
- Model judge。
- 原子能力调用。
- 任务历史。
- 调试信息收集。

### 5.4 `packages/schema-ui`

Schema 解析：

- `jsonSchema` / `uiSchema` 解析。
- 标准结果类型转换。
- 基础校验。
- 渲染树生成。

### 5.5 `packages/vue-renderer`

Vue 3 renderer：

- Workbench Shell。
- 左侧工具栏。
- 中间会话流。
- 右侧 Drawer。
- Schema UI 组件。
- 消息卡片。
- `facadeContext` 注入。

基于 `shadcn-vue` 实现内置基础组件。

### 5.6 `packages/model-adapter`

模型适配：

- Mock Model Adapter。
- Real Model Adapter 接口定义。
- 默认使用 Mock。

### 5.7 `packages/skill-loader`

Skill 装载：

- 处理由构建插件生成的 Skill Registry。
- 校验 agent / mcp 协议。
- 注册原子能力与原子组件。

### 5.8 `packages/vite-plugin`

Vite 插件：

- 读取 `src/skills/agent.json`。
- 解析每个 Skill 的 `mcp.json`。
- 读取 `skill.md`。
- 生成原子能力 import。
- 生成原子组件 import。
- 暴露虚拟模块。

是否由 `packages/facade` re-export，根据实现时职责清晰度决定。

### 5.9 `packages/mock-server`

Fastify Mock Server：

- 创建字典。
- 创建 SKU。
- 查询用户信息。
- 生成知识库跳转链接。

### 5.10 `examples/vue-demo`

Vue 3 宿主项目示例：

- 安装并使用 `@eff-facade/facade`。
- 配置 Vite 插件。
- 提供 `src/skills/agent.json`。
- 提供示例 Skill。
- 挂载 Workbench。

## 6. 示例 Skill

MVP 示例 Skill 放在：

```text
examples/vue-demo/src/skills/
```

当前 demo 收敛为两个参考 Skill：

- `dictionary-skill`：创建字典，验证生成式表单、自定义组件、Mock Server 保存。
- `business-skill`：验证创建 SKU 确认卡、知识库跳转卡、用户查询结构化展示。

参考说明见：

```text
examples/vue-demo/src/skills/README.md
```

## 7. 主要测试点

MVP 暂不编写详细测试计划，但需要记录主要测试点。

### 7.1 协议解析

- `agent.json` 能正确读取。
- `mcp.json` 能正确读取。
- `skill.md` 能作为原始文本进入 Skill Registry。
- 禁用 Skill 不参与召回。

### 7.2 Skill 装载

- Vite 插件能生成虚拟模块。
- 原子能力能被正确 import。
- 原子组件能被正确 import。
- 路径错误时有可理解错误。

### 7.3 Runtime 链路

- 用户输入能触发 Skill recall。
- Mock Model Adapter 能命中目标 Skill。
- Runtime 能调用原子能力。
- 原子能力中间态能下行。
- 原子能力最终结果能渲染。

### 7.4 Schema UI

- `message` 渲染正确。
- `confirmation` 渲染正确并支持确认。
- `form` 渲染正确并支持提交。
- `description` / `table` 渲染正确。
- `link-card` 渲染正确。
- `component` / `mixed` 能渲染。

### 7.5 Workbench

- 左侧工具栏可用。
- 中间会话流可用。
- 右侧 Drawer 可打开。
- 任务历史可记录。
- 调试面板能展示关键链路信息。

### 7.6 Mock Server

- 字典创建接口可用。
- SKU 创建接口可用。
- 用户查询接口可用。
- 知识库链接接口可用。

## 8. MVP 暂不做

- React Demo。
- React renderer 实现。
- Web Components 组件分发。
- Server-side Executor。
- 真实 SSO。
- 权限控制。
- 审计日志。
- 字段脱敏。
- 多轮上下文。
