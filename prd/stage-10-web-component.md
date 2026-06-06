# Stage 10 Workbench Web Component 方案

## 1. 目标

Stage 10 的目标是让宿主项目以框架无关方式接入 EFF Facade Workbench。

Stage 9 已经完成 Workbench 架构归位：

- Workbench 是 Facade 核心内置应用。
- Renderer adapter 只负责 Skill 下行内容渲染。
- Workbench 当前内部使用 Vue 3 实现。

Stage 10 在此基础上继续收口：

- 宿主项目不需要直接使用 Vue 组件。
- 宿主项目可以通过 Web Component 或 mount API 挂载 Workbench。
- Workbench 内部技术栈对宿主透明。
- 样式不依赖宿主 Tailwind content 扫描。

## 2. 推荐输出形态

第一版建议同时提供两个入口：

```ts
defineEffFacadeWorkbenchElement()
```

和：

```ts
mountEffFacadeWorkbench(container, options)
```

原因：

- Custom Element 适合声明式接入。
- mount API 适合需要传入复杂对象的宿主项目。
- Runtime、registry、adapter 都是复杂对象，不适合完全通过 HTML attribute 传递。

## 3. Custom Element

建议 tag name：

```html
<eff-facade-workbench></eff-facade-workbench>
```

注册方式：

```ts
import { defineEffFacadeWorkbenchElement } from '@eff-facade/facade/web-component'

defineEffFacadeWorkbenchElement()
```

声明式使用：

```html
<eff-facade-workbench id="facade"></eff-facade-workbench>
```

复杂配置通过属性或方法注入：

```ts
const element = document.querySelector('#facade')

element.configure({
  runtime,
  initialPrompt,
  title,
  examplePrompts
})
```

## 4. Mount API

推荐主接入方式：

```ts
import { mountEffFacadeWorkbench } from '@eff-facade/facade/web-component'

const app = mountEffFacadeWorkbench(document.querySelector('#facade-root'), {
  runtime,
  initialPrompt: '创建一个字典 storage_level',
  title: 'AI Workbench',
  runtimeStatusText: 'WMS runtime',
  examplePrompts: []
})
```

返回值：

```ts
interface MountedFacadeWorkbench {
  update: (options: Partial<FacadeWorkbenchMountOptions>) => void
  unmount: () => void
}
```

## 5. Options 协议

```ts
interface FacadeWorkbenchMountOptions {
  runtime: FacadeRuntime
  initialPrompt?: string
  title?: string
  eyebrow?: string
  emptyTitle?: string
  runtimeStatusText?: string
  examplePrompts?: string[]
  theme?: FacadeWorkbenchTheme
  events?: FacadeWorkbenchEvents
}
```

`runtime` 是必填项。

宿主项目仍然负责创建 Runtime：

```ts
const runtime = createRuntime({
  registry: skillRegistry,
  adapters
})
```

这样可以保持模型来源、业务接口、路由能力仍由宿主注入。

## 6. Events 协议

```ts
interface FacadeWorkbenchEvents {
  onRouteOpen?: (href: string) => void
  onTaskChange?: (task: FacadeTask) => void
  onError?: (error: Error) => void
  onDebugTrace?: (trace: RuntimeDebugTrace) => void
}
```

MVP 阶段不强制实现全部事件，但需要为后续治理和宿主观测保留结构。

## 7. 样式策略

Stage 9 中，Vue Demo 仍需要 Tailwind 扫描：

```ts
../../packages/workbench/src/**/*.{vue,ts}
```

Stage 10 需要移除这个要求。

推荐策略：

1. `packages/workbench` 构建独立 CSS bundle。
2. Web Component 默认注入 Workbench CSS。
3. Skill 自定义组件样式仍由宿主项目或组件自身处理。
4. 后续再评估是否使用 Shadow DOM。

### Shadow DOM 取舍

优点：

- 样式隔离更强。
- 不容易污染宿主项目。

风险：

- 弹层、tooltip、portal 类组件需要额外处理。
- Skill 自定义组件如果依赖宿主全局样式，可能被隔离影响。
- CSS 变量和主题继承需要额外设计。

MVP 推荐：

- 先输出独立 CSS bundle。
- 不默认启用 Shadow DOM。
- 保留 `shadowRoot: boolean` 选项作为后续扩展。

## 8. Renderer 接入

Workbench 内部仍然调用 Skill result renderer。

Stage 10 第一版可以继续使用 Vue renderer：

```text
Workbench Web Component
  -> internal Vue app
  -> EffFacadeWorkbench
  -> EffResultCard from vue-renderer
```

这意味着：

- Workbench 对宿主框架无关。
- Skill result 暂时仍由 Vue renderer 实现。
- React renderer 后续可以作为 result renderer 替换点，而不是重写 Workbench shell。

## 9. Vite 插件关系

Vite 插件仍从：

```ts
@eff-facade/facade/vite
```

导入。

Web Component 入口建议从：

```ts
@eff-facade/facade/web-component
```

导入。

避免把 Node 构建插件和浏览器运行时入口混在同一个子路径中。

## 10. 包结构建议

```text
packages/
  workbench/
    src/
      index.ts
      web-component.ts
      mount.ts
      styles.css
      components/
    dist/
      index.js
      web-component.js
      style.css

  facade/
    src/
      index.ts
      vite.ts
      web-component.ts
```

主包导出：

```text
@eff-facade/facade
@eff-facade/facade/vite
@eff-facade/facade/web-component
```

## 11. 验证 Demo

Stage 10 至少需要两个 demo：

### Vue Demo

继续保留当前 Vue Demo，用于验证宿主项目中使用 Facade 的完整业务链路。

### HTML Demo

新增原生 HTML demo：

```text
examples/html-demo/
```

目标：

- 不直接使用 Vue。
- 通过 `mountEffFacadeWorkbench` 挂载。
- 使用同一套 mock runtime / mock skills。
- 验证 Workbench 对宿主框架无感。

## 12. 验收项

- `@eff-facade/facade/web-component` 可以导出 mount API。
- HTML Demo 可以挂载 Workbench。
- Vue Demo 原有五个场景不受影响。
- Workbench 样式不依赖宿主 Tailwind content 扫描。
- Vite 插件仍从 `@eff-facade/facade/vite` 使用。
- Skill result renderer 仍可渲染 form、confirmation、mixed、component。
- `unmount` 后不残留 Vue app 或 DOM 事件。

## 13. 当前不做

- 不实现 React renderer。
- 不实现远程组件加载。
- 不实现 Shadow DOM 强隔离。
- 不实现真实模型 Adapter。
- 不实现 SSO、权限、审计和脱敏。

这些作为后续阶段继续推进。

