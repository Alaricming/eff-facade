# Runtime 运行协议

## 1. 目标

Runtime 运行协议描述一次用户输入在 AI Facade 中如何被处理、如何命中 Skill、如何调用原子能力，以及如何下行消息和 UI。

## 2. 核心链路

第一版核心链路：

```text
user input
  -> skill recall
  -> model judge
  -> atomic ability run
  -> render result
```

展开后：

1. 用户在 Workbench 输入自然语言。
2. Runtime 基于宿主项目 `src/skills/*/skill.md` 进行候选 Skill 召回。
3. Model Adapter 对候选 Skill 做意图判断、参数提取和执行选择。
4. Runtime 调用被选中的原子能力。
5. 原子能力返回中间态、自然语言描述、Schema UI、自定义组件或最终结果。
6. Runtime 将结果下行为消息。
7. Renderer 根据结果类型渲染对应 UI。
8. Runtime 记录 Debug Trace，用于任务历史、调试面板和后续审计扩展。

## 3. 原子能力

原子能力是 Skill 中可被模型调用的最小业务执行单元。

目录位置：

```text
host-project/
  src/
    skills/
      some-skill/
        apis/
          create-sku.ts
          query-user.ts
```

规则：

- 位于 `some-skill/apis` 中。
- 由业务方实现，并以 `export async function` 的形式导出。
- 注册到 `some-skill/mcp.json`。
- 可被模型选择调用。
- Facade Runtime 负责调用，但不关心内部业务逻辑。

原子能力签名详见 [protocol-v0.1.md](./protocol-v0.1.md)。

## 4. 返回结果

原子能力支持返回：

- 中间态。
- 自然语言描述。
- 确认卡片。
- 表单。
- 查询结果。
- 跳转链接。
- 自定义组件。
- 混合内容。
- 错误。

示例：

```json
{
  "type": "message",
  "status": "running",
  "content": "正在为你解析字典枚举项。"
}
```

```json
{
  "type": "form",
  "status": "waiting_user_input",
  "title": "创建 SKU",
  "jsonSchema": {},
  "uiSchema": {}
}
```

```json
{
  "type": "message",
  "status": "done",
  "content": "SKU 已创建成功。"
}
```

## 5. 二次确认

二次确认通过 Schema 配置声明。

Runtime 不把所有写操作硬编码为特殊流程，而是读取 Schema 中的确认配置，由渲染层渲染需要二次确认的组件。

示例：

```json
{
  "type": "confirmation",
  "title": "确认创建字典",
  "requiresConfirmation": true,
  "confirmText": "确认创建",
  "cancelText": "取消",
  "data": {
    "code": "storage_level"
  }
}
```

真正二次确认点击后的逻辑在组件内部处理。

组件内部可以：

- 调用已注册原子能力。
- 调用宿主项目服务。
- 使用 Facade 提供的 `facadeContext` 和 Adapter。
- 下行执行结果。

## 6. 表单提交

表单提交不要求 Runtime 统一接管所有提交动作。

原则：

- 写在 `some-skill/apis` 中并 export 出来的原子能力，是模型可调用能力。
- Schema UI 中的标准表单可通过声明调用原子能力。
- 自定义组件内部的交互逻辑由组件自行处理。
- Facade 提供上下文、能力注册表和消息下行能力。

## 7. 普通问答

普通问答建议作为 Model Adapter 的 fallback，而不是普通业务 Skill。

原因：

- 普通问答不是业务能力包。
- 不应该进入写操作或业务 API 执行流程。
- 未命中 Skill 时自然降级到问答更符合用户预期。

处理流程：

1. Skill recall 未找到候选，或模型判断不应调用 Skill。
2. Runtime 调用 Model Adapter 的 `chat` 能力。
3. Model Adapter 返回自然语言回答。
4. Runtime 下行文本消息。

## 8. 运行边界

Runtime 负责：

- 读取 Skill。
- 召回 Skill。
- 调用模型判断。
- 调用原子能力。
- 管理消息下行。
- 为组件提供上下文。
- 记录本次运行的关键事件。

原子能力负责：

- 处理业务参数。
- 调用 Mock Server 或业务服务。
- 返回标准结果。

组件负责：

- 渲染复杂交互。
- 处理组件内部确认、提交、取消等行为。
- 在需要时调用原子能力或宿主能力。

## 9. Debug Trace

MVP 阶段 Runtime 需要为每次运行记录一份轻量 Debug Trace。

Trace 面向两个目标：

- 开发和演示阶段解释一次请求为什么命中某个 Skill。
- 为后续公司级治理中的审计、问题定位、效果评估预留结构。

Trace 至少包含：

- 原始输入。
- 候选 Skill。
- 模型选择的 Skill 和原子能力。
- 模型提取参数。
- 原子能力输入。
- 原子能力返回结果。
- 渲染结果类型。
- 错误信息。
- 阶段事件。

阶段事件使用时间线表达：

```text
input -> recall -> judge -> ability -> render
```

异常时追加：

```text
error
```

阶段事件只记录运行解释所需的最小信息，不在 MVP 中承担正式审计职责。正式审计、脱敏、持久化和权限控制记录到治理待办。
