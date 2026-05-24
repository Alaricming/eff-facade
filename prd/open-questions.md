# 待澄清问题池

## 第一轮：产品边界

1. AI Facade 第一阶段主要服务于哪个既有系统或业务域？（已初步明确）
   - WMS？
   - 商品 / SKU？
   - 知识库？
   - 统一中后台入口？
   - 当前结论：第一版通过 Mock Server 验证创建字典、创建 SKU、知识库跳转、用户信息查询四类场景。

2. 第一版更偏向嵌入现有项目，还是独立部署成一个平台？（已明确）
   - 当前结论：第一版优先嵌入已有项目。

3. 会话窗口是全局悬浮入口，还是作为某个页面内的主工作区？（已明确）
   - 当前结论：主工作区 Workbench，预留复杂效果承载空间。

4. 第一版是否要求支持多轮上下文？（已明确）
   - 例如用户先说“创建 SKU”，后续说“品牌是 X，类目是 Y”。
   - 当前结论：第一版暂不支持多轮上下文。

5. AI Facade 是否要支持纯闲聊或知识问答，还是只处理业务 Skill？（已明确）
   - 当前结论：支持普通问答，但普通问答不执行业务写操作。

## 第二轮：Skill 机制

1. Skill 第一阶段希望由谁开发？（已明确）
   - Facade 平台团队？
   - 各业务项目团队？
   - 两者都支持？
   - 当前结论：第一版内置几个示例 Skill，用于展示和验证。

2. Skill 是纯前端声明，还是必须包含服务端执行逻辑？（已明确）
   - 当前结论：Skill 是业务能力包。能力封装在 `some-skill/apis/xxx.ts`，注册到 `some-skill/mcp.json`。Facade 只负责运行和结果下行，不关注内部逻辑。

3. Skill 的命中条件希望主要靠什么？（已明确）
   - 关键词 / 规则？
   - Embedding 检索？
   - 大模型 Function Calling / Tool Calling？
   - 多阶段混合路由？
   - 当前结论：两段式。每个 Skill 根目录有 `skill.md` 标准信息用于命中，先召回候选，再由模型判断。

4. Skill 是否允许业务方提供自定义前端组件？（已明确）
   - 当前结论：支持。组件放在 `some-skill/components/xxx.vue`，注册到 `some-skill/mcp.json`。

5. Skill 是否需要版本管理和灰度能力？

## 第三轮：Schema 与 UI

1. 表单 Schema 倾向于直接兼容 JSON Schema，还是定义一套业务 UI Schema？（已明确）
   - 当前结论：采用双层 Schema。`jsonSchema` 兼容 JSON Schema，`uiSchema` 描述展示和交互。

2. 需要支持哪些基础组件？（已明确）
   - input
   - select
   - date picker
   - upload
   - table
   - description
   - confirmation card
   - stepper
   - 当前结论：第一版内置 `input`、`textarea`、`number`、`date`、`select`、`radio`、`switch`、`description`、`table`、`confirmation`、`link-card`、`section`、`group`。

3. 是否需要复杂表单能力？（已明确）
   - 字段联动
   - 异步选项
   - 动态数组
   - 分步骤表单
   - 条件展示
   - 当前结论：第一版暂不支持，但预留扩展口。

4. 自定义组件和 Schema UI 的关系怎么定？（已明确）
   - 当前结论：允许混合渲染。

5. AI 生成的表单是否允许临时扩展字段，还是必须严格来自 Skill Schema？（已明确）
   - 当前结论：AI 不能临时创造 Skill Schema 之外的业务字段。

## 第四轮：权限与安全

1. 第一版是否需要真实接入 SSO，还是先通过 Mock User Context 模拟登录用户？（已明确）
   - 当前结论：第一版不需要真实 SSO，使用 Mock User Context。

2. 权限判断第一版放在哪里？（已明确）
   - 当前结论：第一版暂不处理权限判断，记录为后续待办。

3. 创建 / 修改 / 删除类操作是否必须二次确认？（已明确）
   - 当前结论：写操作必须二次确认，查询操作默认不需要。

4. 查询结果第一版是否需要字段脱敏？（已明确）
   - 当前结论：第一版使用 Mock 数据，不需要字段脱敏。

5. 是否需要完整审计日志？（已明确）
   - 当前结论：第一版暂不处理审计日志，记录为后续待办。

6. 模型输入是否允许包含敏感业务数据？
   - 待后续真实业务接入前评估。

## 第五轮：跨项目融合

1. 远期统一平台是读取各项目构建产物，还是由各项目主动注册 Skill？

2. 各项目 Skill 的执行逻辑是继续走原项目接口，还是统一迁移到 Facade 服务端？

3. 如果业务项目下线或接口变更，Skill 如何失效和告警？

4. 自定义组件远程加载是否可接受？

## 第六轮：工程形态

1. 这个项目第一版是否直接开始实现？（已明确）
   - 当前结论：暂不执行，继续澄清更多技术细节。

2. 技术栈是否倾向 Vue？是否需要兼容 React？（已初步明确）
   - 当前结论：需要评估并预留 Vue / React 双兼容。
   - 当前判断：Runtime、Skill 协议、Schema UI 协议应框架无关；标准 UI 通过 Vue / React renderer 适配；自定义组件跨框架成本较高，建议后续通过 Web Components 承载。

3. NPM 包结构要不要按 Monorepo 设计？（已明确）
   - 当前结论：需要，严格按照 Monorepo 设计。
   - 修正：Facade 仓库以 `packages/facade` 为唯一主入口包，其他 packages 作为主包依赖；使用者只安装一个包。宿主项目的 Skill 放在宿主项目 `src/skills` 下。

4. Mock Server 用什么实现？（已明确）
   - 当前结论：使用 Fastify。

5. 模型接入第一版怎么处理？（已明确）
   - 当前结论：Mock Model Adapter 和真实模型 Adapter 都保留，默认使用 Mock，后续切真实模型。

## 第七轮：Runtime 运行协议

1. 用户输入后的 Runtime 链路是否为 `input -> skill recall -> model judge -> api run -> render result`？（已明确）
   - 当前结论：是。

2. Skill 原子能力返回结果，是只返回最终 UI，还是允许返回中间状态？（已明确）
   - 当前结论：支持返回中间态和自然语言描述。

3. confirmation 的执行方式怎么设计？（已明确）
   - 当前结论：在 Schema 中配置二次确认，由渲染层渲染确认组件，真正二次确认点击逻辑在组件内部处理。

4. 表单提交时，是否由 Facade Runtime 直接调用 `submitAction.abilityId`？（已明确）
   - 当前结论：写在 `some-skill/apis` 中并 export 出来的原子能力是模型调用；组件内部交互由组件自行处理。

5. 普通问答是否也抽象成一种内置 Skill，还是放在 Model Adapter fallback？（已明确）
   - 当前结论：普通问答作为 Model Adapter fallback 更合适，不作为业务 Skill。

## 第八轮：Skill 装载与构建

1. 宿主项目的 `src/skills` 如何被 Facade 发现？（已明确）
   - 当前结论：Facade Adapter 注册 Skill 根目录，例如 `src/skills`。该目录下必须有 `agent.json`，用于注册所有 Skill。

2. 每个 Skill 内部如何注册内容？（已明确）
   - 当前结论：每个 Skill 内部通过 `mcp.json` 注册原子能力、原子组件等所有信息。

3. `skill.md` 与 `mcp.json` 如何被前端构建环境读取？（已初步明确）
   - 当前建议：从降低宿主项目入侵性的角度，长期使用 Facade 构建插件统一处理。MVP 先实现 Vite 插件，读取 `agent.json`、`mcp.json`、`skill.md` 并生成虚拟模块。

4. `agent.json` 与静态 import 是否是一个意思？（已明确）
   - 当前结论：不是。`agent.json` 是产品协议，声明有哪些 Skill；静态 import 是构建实现手段，用于让 bundler 打包真实模块。

5. 原子能力执行位置如何处理？（已明确）
   - 当前结论：MVP 先浏览器端执行并调用 Mock Server；未来支持公司级 Server-side Executor，记录为待办。

6. 自定义组件注册采用显式 import 还是 `mcp.json` entry 动态加载？（已初步明确）
   - 当前建议：MVP 采用 `mcp.json` entry + Vite 插件生成动态 import，复杂度中等，但更低侵入，也更符合两级注册模型。

## 第九轮：协议 v0.1

1. `agent.json` 和 `mcp.json` 的字段标准是否现在定一个 v0.1 草案？（已明确）
   - 当前结论：可以，已收敛到协议 v0.1。

2. 原子能力函数签名怎么定？（已明确）
   - 当前结论：根据实际需要定，但最终以 `export async function` 形式导出。

3. 原子能力返回结果协议是否要收敛？（已明确）
   - 当前结论：先定 v0.1，支持 `message`、`form`、`confirmation`、`description`、`table`、`link-card`、`component`、`mixed`、`error`，并保留扩展空间。

4. 组件内部如何调用原子能力和下行消息？（已明确）
   - 当前结论：通过 `facadeContext`。

5. `agent.json` 是否支持多个 agent？（已明确）
   - 当前结论：一个宿主项目只支持一个 `agent.json`，其中包含多个 Skill。

## 第十轮：Workbench 交互形态

1. Workbench 是全屏页面、左右分栏，还是类似 IDE 的三栏布局？（已明确）
   - 当前结论：左侧工具栏，中间主会话区，右侧通过按钮打开的 Drawer。

2. 消息区和生成式 UI 区域是混在一起，还是“左侧会话，右侧工作区”？（已明确）
   - 当前结论：混在一起，从上到下的会话形式。

3. Skill 结果展示在哪里？（已明确）
   - 当前结论：作为消息卡片展示。

4. 是否需要任务历史列表？（已明确）
   - 当前结论：需要，放在右侧 Drawer 中。

5. MVP 是否需要调试信息面板？（已明确）
   - 当前结论：需要，放在右侧 Drawer 中。

## 第十一轮：视觉与组件规范

1. 整体视觉方向是什么？（已明确）
   - 当前结论：宽松、简洁、轻科技感，亮色主题。

2. 左侧工具栏是只放 icon，还是 icon + text？（已明确）
   - 当前结论：icon 为主，配合 tooltip 提示。

3. 消息卡片风格是什么？（已明确）
   - 当前结论：ChatGPT 式宽松气泡与中后台信息卡片结合，更偏宽松气泡。

4. 是否需要主题能力？（已明确）
   - 当前结论：MVP 只支持亮色主题。

5. 是否默认使用宿主项目 UI 组件库，还是 Facade 内置组件？（已明确）
   - 当前结论：Facade 内置 Vue3/React 基础组件，基于 `shadcn-vue` / `shadcn`，MVP 暂时只实现 Vue3。Skill 自定义组件使用宿主项目环境编译，可使用宿主项目已安装组件库。

## 第十二轮：MVP 实现拆解

1. 第一版是否只做 Vue demo，不做 React demo？（已明确）
   - 当前结论：制作 Vue Demo。架构仍是统一 Schema、多 renderer 适配，MVP 只做 Vue 3 适配。

2. Monorepo 包管理用什么？（已明确）
   - 当前结论：使用 `pnpm workspace`。

3. Facade 主包命名是什么？（已明确）
   - 当前结论：`@eff-facade/facade`。

4. Vite 插件作为主包内置导出，还是单独包再由主包 re-export？（已明确）
   - 当前结论：根据实际代码设计，符合职责分离、逻辑清晰即可。

5. MVP 是否需要写测试计划？（已明确）
   - 当前结论：记录主要测试点，暂不写详细测试计划。
