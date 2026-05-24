# MVP 验收清单

## 1. 验收目标

本清单用于重复验证 EFF Facade MVP 是否满足当前阶段目标：

- Vue Demo 可以作为宿主项目运行 Facade。
- Skill 可以通过 `agent.json -> mcp.json -> skill.md` 装载。
- Runtime 可以完成自然语言输入、Skill 命中、原子能力调用和结果渲染。
- Workbench 可以承载会话、生成式 UI、任务历史和调试信息。

## 2. 验收前准备

运行静态验证：

```bash
pnpm --filter @eff-facade/vue-demo validate:skills
pnpm --filter @eff-facade/core typecheck
pnpm --filter @eff-facade/schema-ui typecheck
pnpm --filter @eff-facade/vue-renderer typecheck
pnpm --filter @eff-facade/vue-demo build
```

启动 Mock Server：

```bash
pnpm --filter @eff-facade/mock-server dev
```

启动 Vue Demo：

```bash
pnpm --filter @eff-facade/vue-demo dev -- --host 127.0.0.1
```

访问：

```text
http://localhost:5174/
```

## 3. 通用验收项

- 左侧工具栏拉满视口高度。
- 中间会话区可独立滚动。
- 输入框固定在底部区域。
- 右侧 Drawer 可打开和关闭。
- 发送请求后有运行中反馈。
- 任务历史展示最近任务。
- 调试面板展示 selected Skill、Ability、候选数量、阶段时间线和原始 Trace。
- 设置面板展示 Runtime、模型来源和能力状态。

## 4. 场景 A：普通问答

输入：

```text
什么是 facade？
```

期望：

- 不执行业务接口。
- 不命中业务写操作。
- 返回 `message`。
- 任务历史 summary 为普通问答或文本结果。
- 调试面板中 `fallbackToChat` 或未选择业务 Ability。

## 5. 场景 B：创建字典

输入：

```text
创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3
```

期望命中：

- Skill：`dictionary-skill`
- Ability：`create_dictionary`

期望结果：

- 初始返回 `mixed`。
- `mixed.blocks[0]` 为 `form`。
- `mixed.blocks[1]` 为 `component`。
- 自定义组件 ID：`dictionary_preview`。
- 表单默认填入 `storage_level`。
- 表单覆盖基础字段组件：
  - `input`
  - `textarea`
  - `number`
  - `date`
  - `select`
  - `radio`
  - `checkbox`
- 字段级 `helpText` 可见。
- disabled 字段不可编辑。
- 自定义组件展示枚举项：
  - `充足 = 1`
  - `紧张 = 2`
  - `空 = 3`

提交表单后：

- 调用 `POST /api/dictionaries`。
- 返回 `message`。
- 消息包含 `已保存字典：storage_level`。
- 原表单显示已提交状态。
- 原表单字段和按钮被锁定，不能重复提交。

Drawer 检查：

- 任务历史显示 `dictionary-skill`。
- 任务历史显示 `create_dictionary`。
- 调试面板 selected 为 `dictionary-skill / create_dictionary`。
- 调试面板时间线包含 `input -> recall -> judge -> ability -> render`。

失败重试：

- 将字典编码改为 `existing_dictionary` 后提交。
- Mock Server 返回 `409`。
- 会话中展示 `error`，错误详情包含 `字典编码已存在：existing_dictionary`。
- 原表单不显示已提交状态。
- 原表单仍可编辑并允许重新提交。
- 调试面板时间线包含 `error`。
- 将字典编码改回其他值后可再次提交成功。

## 6. 场景 C：创建 SKU

输入：

```text
创建一个 SKU，编码 SKU-001，名称 蓝牙耳机
```

期望命中：

- Skill：`business-skill`
- Ability：`create_sku`

期望结果：

- 初始返回 `confirmation`。
- 确认卡展示：
  - `skuCode = SKU-001`
  - `skuName = 蓝牙耳机`
- 有确认按钮。
- 默认状态为待确认。
- 点击取消后显示已取消，不调用 `/api/skus`。
- 点击确认后进入执行中状态，按钮不可重复点击。

确认后：

- 调用 `POST /api/skus`。
- 返回 `message`。
- 消息包含 `SKU 已创建：SKU-001`。

Drawer 检查：

- 任务历史显示 `business-skill`。
- 任务历史显示 `create_sku`。
- 调试面板 selected 为 `business-skill / create_sku`。
- 调试面板时间线包含确认前的 `render` 和确认后的 `ability -> render`。

## 7. 场景 D：创建知识库

输入：

```text
我想创建一个知识库
```

期望命中：

- Skill：`business-skill`
- Ability：`open_knowledge_base_create`

期望结果：

- 返回 `link-card`。
- 标题为创建知识库相关文案。
- 描述说明复杂流程会跳转到业务页面。
- 链接包含 `/knowledge-base/create`。

点击后：

- 调用宿主 `router.open`。
- Workbench 底部出现已打开路由提示。

Drawer 检查：

- 任务历史显示 `open_knowledge_base_create`。
- 调试面板 selected 为 `business-skill / open_knowledge_base_create`。

## 8. 场景 E：查询用户信息

输入：

```text
查看用户 u1001 的当前信息
```

期望命中：

- Skill：`business-skill`
- Ability：`get_user_profile`

期望结果：

- 返回 `mixed`。
- 包含 `description`：
  - `userId = u1001`
  - `name = 张三`
  - `department = 供应链中台`
  - `role = 仓储运营`
  - `status = 启用`
- 包含 `table`：
  - 时间
  - 动作
  - 对象

接口：

- 调用 `GET /api/users/u1001`。

Drawer 检查：

- 任务历史显示 `get_user_profile`。
- 调试面板 selected 为 `business-skill / get_user_profile`。

## 9. 通过标准

MVP 验收通过需要满足：

- 静态验证命令全部通过。
- 五个场景均可在 Vue Demo 中完成。
- 每个业务场景都有正确 Skill 和 Ability。
- 每个业务场景都有正确 result 类型。
- 写操作需要用户提交或确认。
- 任务历史和调试面板能辅助定位执行链路。

## 10. 当前不验收

- 真实模型调用。
- 多轮上下文。
- 真实 SSO。
- 权限控制。
- 字段脱敏。
- 审计日志。
- React renderer。
- Web Components。
- 跨项目 Skill 聚合。
