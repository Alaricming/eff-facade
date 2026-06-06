# Stage 9 Workbench 架构归位验收

## 1. 目标

Stage 9 用于收口 Workbench 与 renderer 的职责边界。

结论：

- Workbench 是 Facade 核心内置应用。
- Renderer adapter 只负责 Skill 下行内容的渲染。
- MVP 允许 Workbench 内部使用 Vue 3 实现。
- Stage 10 再将 Workbench 输出为 Web Component / mount API，进一步实现宿主框架无关接入。

## 2. 包边界

### `@eff-facade/workbench`

职责：

- 会话 shell。
- 左侧工具栏。
- 主会话区。
- 底部输入区。
- 右侧 Drawer。
- 任务历史。
- 调试面板。
- 设置面板。
- Runtime 状态展示。

当前公开导出：

- `EffFacadeWorkbench`
- Workbench 设计 token

内部组件例如 Drawer 不作为主公共 API 暴露。

### `@eff-facade/vue-renderer`

职责：

- Skill result Vue 渲染。
- Schema UI Vue 表单。
- 确认卡片。
- 描述块。
- 表格块。
- 链接卡片。
- mixed blocks。
- 自定义 Vue 组件承载。

不再导出：

- Workbench shell。
- Workbench Drawer。
- Workbench layout tokens。

### `@eff-facade/facade`

职责：

- 作为宿主项目主要安装入口。
- 聚合导出 runtime、core、schema-ui、workbench、renderer、model adapter、skill loader。
- 从子路径 `@eff-facade/facade/vite` 导出 Vite 插件，避免 Node 配置阶段加载浏览器 UI。

## 3. MVP 宿主接入边界

当前 Stage 9 仍是 Vue Demo 接入形态。

由于 Workbench 和 Vue renderer 仍通过 Tailwind class 输出 UI，Vue Demo 的 Tailwind `content` 必须扫描：

```ts
content: [
  './index.html',
  './src/**/*.{vue,ts}',
  '../../packages/vue-renderer/src/**/*.{vue,ts}',
  '../../packages/workbench/src/**/*.{vue,ts}'
]
```

Stage 10 需要把 Workbench dist CSS / Web Component 样式隔离方案单独收口，避免真实宿主项目手动扫描内部源码。

## 4. 验收项

- `packages/workbench` 存在并可独立 typecheck/build。
- `packages/vue-renderer` 只保留 Skill result 渲染组件。
- `packages/facade` 可以从主入口导出 `EffFacadeWorkbench`。
- Vite 插件只能从 `@eff-facade/facade/vite` 导入。
- Vue Demo 的 Tailwind content 包含 `packages/workbench`。
- Vue Demo 能完成五个 MVP 场景。
- 调试面板仍能展示 runtime trace 时间线。
- 生产 build 后 CSS 体积恢复正常，不丢失 Workbench 布局类。

## 5. 当前不做

- 不实现 Web Component。
- 不实现 React renderer。
- 不实现 Workbench dist CSS 独立注入。
- 不处理真实 SSO、权限、审计和脱敏。

这些进入 Stage 10 或后续治理阶段。

