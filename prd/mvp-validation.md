# MVP 验证场景

## 1. 目标

通过一个简单 Mock Server 配合 AI Facade，验证第一版核心能力是否可行：

- 嵌入已有项目。
- 主工作区 Workbench。
- Mock User Context。
- 任务历史。
- 调试信息面板。
- 普通问答。
- 基于 Skill 的意图命中。
- 默认接口处理。
- 生成式 UI 表单。
- 复杂业务跳转。
- 信息查询与结构化展示。

## 2. Mock Server 职责

Mock Server 用于模拟企业内部业务系统接口，第一阶段不追求真实业务完整性，只验证 Facade Runtime 与 Skill 协议。

建议提供接口：

| 接口 | 方法 | 用途 |
| --- | --- | --- |
| `/api/dictionaries` | `POST` | 创建字典 |
| `/api/skus` | `POST` | 创建 SKU |
| `/api/users/:id` | `GET` | 查询用户信息 |
| `/api/knowledge-base/link` | `GET` | 生成知识库创建跳转链接 |

## 3. 验证场景

### 3.1 默认接口处理：创建字典

用户输入：

> 创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3

预期行为：

- AI Facade 识别为创建字典。
- 提取：
  - 字典编码：`storage_level`
  - 枚举项：`充足=1`、`紧张=2`、`空=3`
- 展示 `mixed` 结果：
  - 标准 `form` 表单。
  - 自定义组件 `dictionary_preview`。
- 用户提交表单后调用 `/api/dictionaries`。
- 会话中展示创建成功结果。

### 3.2 二次确认：创建 SKU

用户输入：

> 创建一个 SKU，编码 SKU-001，名称 蓝牙耳机

预期行为：

- AI Facade 命中创建 SKU Skill。
- 提取 SKU 编码和名称。
- 展示 `confirmation` 确认卡片。
- 用户确认后调用 `/api/skus`。
- 展示创建结果。

### 3.3 复杂业务：直接跳转

用户输入：

> 我要创建一个知识库

预期行为：

- AI Facade 命中知识库创建 Skill。
- 判断该场景步骤较多，不在会话内完整承载。
- 调用或生成深链。
- 展示跳转卡片。
- 点击后进入指定页面、步骤或锚点。

### 3.4 信息查询与展示

用户输入：

> 查看用户 u1001 的当前信息

预期行为：

- AI Facade 命中用户查询 Skill。
- 提取用户 ID：`u1001`。
- 调用 `/api/users/u1001`。
- 在会话中展示 `mixed` 结构化结果：
  - `description` 用户基础信息。
  - `table` 最近操作。

### 3.5 普通问答

用户输入：

> 什么是 facade？

预期行为：

- 未命中具体业务 Skill。
- 调用普通问答能力。
- 直接返回自然语言回答。
- 不执行任何业务接口。

## 4. MVP 暂不支持

- 多轮上下文补参。
- 跨消息任务状态管理。
- 远程 Skill 聚合。
- Skill 灰度与版本治理。
- 复杂审批流。
- 字段级权限脱敏。
- 真实 SSO。
- 权限判断。
- 审计日志。
- 独立任务详情页。
- 多标签任务工作区。

## 5. 可执行验证命令

在本地验证前，先执行：

```bash
pnpm --filter @eff-facade/vue-demo validate:skills
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

默认访问：

```text
http://localhost:5174/
```
