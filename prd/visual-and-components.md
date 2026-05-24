# 视觉与组件规范

## 1. 视觉方向

AI Facade Workbench 的视觉方向：

- 宽松。
- 简洁。
- 轻科技感。
- 亮色主题。
- 面向企业中后台，但不做传统密集表格后台风格。

整体体验应更接近现代 AI 工作台，而不是传统管理系统页面。视觉上优先采用安静、克制、工具化的表达：低饱和中性色、清晰边界、轻阴影、稳定布局，让用户注意力停留在会话、生成式 UI 和执行结果上。

## 1.1 Design Language v0.1

EFF Facade MVP 采用一套内置的轻量设计语言，先服务 Workbench 与 Schema UI，后续再开放主题继承和宿主项目 token 映射。

### 色彩 token

| Token | 默认值 | 用途 |
| --- | --- | --- |
| `eff.bg` | `#f7f7f4` | 页面背景，提供轻微暖灰底色 |
| `eff.surface` | `#ffffff` | 主内容面、卡片、气泡 |
| `eff.surface-raised` | `#fbfbf9` | 抬升面、表单区域、结果容器 |
| `eff.muted-surface` | `#eeeeea` | hover、弱按钮、局部背景 |
| `eff.text` | `#1f1f1c` | 主文本 |
| `eff.muted` | `#6f6f68` | 次级文本、图标 |
| `eff.subtle` | `#9a9a92` | 辅助信息、时间、提示 |
| `eff.border` | `#deded8` | 默认边框 |
| `eff.border-strong` | `#c8c8c0` | focus、强调边框 |
| `eff.accent` | `#20201d` | 主操作、激活状态 |
| `eff.info` | `#0f766e` | 信息态 |
| `eff.success` | `#047857` | 成功态 |
| `eff.warning` | `#b45309` | 警告态 |
| `eff.danger` | `#b42318` | 错误态 |

### 圆角与阴影

| Token | 默认值 | 用途 |
| --- | --- | --- |
| `eff-sm` | `6px` | 输入框、标签、紧凑按钮 |
| `eff-lg` | `8px` | icon 按钮、普通控件 |
| `eff-xl` | `10px` | 结果卡片、Drawer 分区 |
| `eff-2xl` | `12px` | 会话气泡、输入区 |
| `shadow-eff-hairline` | `0 0 0 1px rgba(31, 31, 28, 0.06)` | 轻边界抬升 |
| `shadow-eff-soft` | `0 12px 34px rgba(31, 31, 28, 0.08)` | Drawer、浮层 |
| `shadow-eff-pop` | `0 18px 48px rgba(31, 31, 28, 0.12)` | 后续弹层、确认面板 |

### 组件规则

- 使用 Tailwind token class，不在组件内散落裸色值。
- icon 统一使用 `@iconify/vue`，icon 名称集中维护。
- 页面框架保持三栏：左侧 60px 工具栏、中间会话主区、右侧可开合 Drawer。
- 卡片只用于结构化结果、表单、Drawer 分区、消息结果块，不把页面整体包成大卡片。
- 主按钮使用深色 `eff.accent`，次级按钮使用白底或 `eff.muted-surface`。
- 焦点态使用 `eff.border-strong`，错误态使用 `eff.danger`。
- 字体采用系统 sans-serif 栈，MVP 不引入品牌字体。
- 默认亮色主题，暗色主题仅作为后续扩展。

## 2. 布局气质

Workbench 使用：

- 左侧 icon 工具栏。
- 中间宽松会话流。
- 右侧可开合 Drawer。

页面应避免过度拥挤，给会话和生成式 UI 留出足够呼吸感。

## 3. 左侧工具栏

左侧工具栏采用 icon 为主。

交互要求：

- 默认只展示 icon。
- hover 时展示 tooltip。
- 当前选中项需要有明确状态。
- icon 语义清晰。

MVP 工具项：

- 新建会话。
- 任务历史。
- 调试面板。
- 设置。

## 4. 消息卡片风格

消息形态结合 ChatGPT 式宽松气泡与中后台信息卡片。

原则：

- 普通文本回复偏宽松气泡。
- 表单、确认、查询结果等结构化内容偏卡片。
- 卡片不应过度厚重。
- 操作按钮清晰但不喧宾夺主。
- 错误和运行中状态需要易识别。

## 5. 主题

MVP 只支持亮色主题。

暗色主题、主题切换、宿主项目主题继承作为后续扩展。

## 6. Facade 内置组件

Facade 内置一套基础组件，覆盖 Workbench 和 Schema UI。

组件实现策略：

- Workbench 是 Facade 核心内置应用，归属 `packages/workbench`。
- Workbench MVP 内部可以用 Vue 3 编写。
- Workbench 后续以 Web Component / mount API 输出，让宿主项目框架无关接入。
- Skill 下行内容由 renderer adapter 渲染，MVP 使用 `packages/vue-renderer`。
- React renderer 后续只负责 Skill result 渲染，不重新实现 Workbench shell。

内置组件范围：

- Workbench Shell。
- 左侧工具栏。
- Drawer。
- 消息列表。
- 输入框。
- 表单控件。
- 确认卡片。
- 描述列表。
- 表格。
- 链接卡片。
- 错误提示。

## 6.1 Workbench 与 Renderer 边界

Workbench 负责：

- 页面 shell。
- 会话流。
- 输入区。
- 工具栏。
- Drawer。
- 任务历史。
- 调试面板。
- 设置面板。
- Runtime 状态展示。

Renderer adapter 负责：

- 渲染 Skill 返回的 result blocks。
- 渲染 Schema UI 表单。
- 渲染确认卡片、描述、表格、链接卡片。
- 加载和承载 Skill 自定义组件。

因此，Workbench 不应因为 MVP 使用 Vue 实现就被放入 `vue-renderer`。`vue-renderer` 只代表 Skill result 的 Vue 渲染适配。

## 7. 宿主环境组件兼容

Skill 自定义组件使用宿主项目环境编译。

也就是说：

- Facade 本身不需要安装宿主项目的 UI 组件库。
- 如果宿主项目安装了 `element-plus`，Skill 自定义组件可以使用 `element-plus`。
- 如果宿主项目安装了其他组件库，Skill 自定义组件也可以在宿主环境中编译和运行。
- Facade 只负责通过构建插件发现、注册和加载组件。

示例：

```vue
<template>
  <el-card>
    <el-descriptions title="用户信息" />
  </el-card>
</template>
```

上面的组件能否运行，取决于宿主项目是否安装并配置了 `element-plus`。

## 8. 组件边界

Facade 内置组件负责：

- 标准 Workbench UI。
- 标准 Schema UI。
- 标准消息卡片。
- 通用交互体验。

宿主 Skill 自定义组件负责：

- 业务专属展示。
- 使用宿主项目已有组件库。
- 承载复杂业务交互。

Facade 不应强行替代宿主项目组件体系。

## 9. 后续扩展

后续可扩展：

- React 内置组件。
- Web Components 组件分发。
- 暗色主题。
- 主题 token。
- 宿主项目主题适配。
- 设计系统桥接。
