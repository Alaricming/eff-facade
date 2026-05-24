# Schema UI Runtime 规范

## 1. 定位

Schema UI Runtime 是 AI Facade 中负责生成式 UI 渲染的核心能力。

它的目标不是替代完整业务页面，而是在会话和 Workbench 中承载一次性、轻量、可确认、可提交的业务 UI。

第一版重点支持：

- 查询结果展示。
- 确认卡片。
- 表单填写与提交。
- 链接跳转卡片。
- 标准组件和自定义组件混合渲染。

## 2. Schema 分层

第一版采用双层 Schema：

1. `jsonSchema`
   - 描述数据结构、字段类型、必填规则、枚举值、基础校验。
   - 尽量兼容 JSON Schema。

2. `uiSchema`
   - 描述展示方式、组件类型、布局、文案、字段顺序、占位提示等。
   - 用于中后台表单和结构化结果的交互表达。

这样可以把“数据约束”和“界面表达”分开，避免模型或业务方把展示逻辑混进数据结构。

## 3. 内置组件

第一版内置组件以 MVP 真实支持为准，后续组件只作为扩展项记录。

### 3.1 输入类

- `input`
- `textarea`
- `number`
- `date`
- `select`
- `radio`
- `switch`
- `checkbox`

### 3.2 展示类

- `description`
- `table`
- `confirmation`
- `link-card`

### 3.3 容器类

- `section`
- `group`

第一版暂不追求完整组件库，只覆盖 MVP 需要的最小闭环。

当前 Vue renderer 已支持：

- `input`
- `textarea`
- `number`
- `date`
- `select`
- `radio`
- `switch`
- `checkbox`

## 4. 表单能力

第一版支持：

- 字段渲染。
- 必填校验。
- 枚举选项。
- 默认值。
- 占位提示。
- 字段描述 `description`。
- 帮助文案 `helpText`。
- 字段隐藏 `hidden`。
- 字段禁用 `disabled`。
- 提交。
- 取消。
- 错误展示。

第一版暂不支持：

- 字段联动。
- 异步选项。
- 动态数组。
- 分步骤表单。
- 条件展示。

但 Schema 结构需要预留扩展口，例如：

```json
{
  "uiSchema": {
    "fields": {
      "brand": {
        "component": "select",
        "x-reactions": []
      }
    }
  }
}
```

`x-reactions` 第一版不实现，只作为未来联动、异步加载、条件展示的扩展位。

字段级 required 校验需要展示到对应字段下方，同时给出表单级错误摘要。

表单提交交互要求：

- 提交中应禁用表单字段和操作按钮。
- 提交成功后，原表单进入已提交状态并锁定，避免重复提交。
- 提交失败时，原表单保持可编辑，允许用户修正后重试。
- 已提交表单如需再次执行，应重新发起业务请求。

## 5. 自定义组件混合渲染

Skill 原子能力的返回结果允许混合标准 Schema UI 与自定义组件。

例如：

```json
{
  "type": "mixed",
  "blocks": [
    {
      "type": "description",
      "title": "用户信息",
      "data": {
        "userId": "10001",
        "name": "张三"
      }
    },
    {
      "type": "component",
      "componentId": "user_profile_card",
      "props": {
        "userId": "10001"
      }
    }
  ]
}
```

混合渲染适用于：

- 标准字段展示 + 自定义详情组件。
- 标准确认卡片 + 自定义预览组件。
- 标准表单 + 自定义辅助选择器。

## 6. AI 生成边界

第一版中，AI 不能临时创造 Skill Schema 之外的业务字段。

允许 AI 做：

- 根据用户输入填充已声明字段。
- 根据 Skill 返回结果组装标准 UI block。
- 在已声明字段范围内生成默认值或说明。

不允许 AI 做：

- 增加 Skill 未声明的提交字段。
- 绕过字段校验。
- 生成未注册的组件 ID。
- 自行决定调用未注册的 API。

## 7. 返回结果类型

Skill 原子能力建议返回标准结果，供 Facade Runtime 下行消息和渲染。

### 7.1 文本

```json
{
  "type": "message",
  "status": "done",
  "content": "已为你创建字典 storage_level。"
}
```

### 7.2 确认卡片

```json
{
  "type": "confirmation",
  "title": "确认创建字典",
  "requiresConfirmation": true,
  "data": {
    "code": "storage_level",
    "items": [
      { "label": "充足", "value": 1 },
      { "label": "紧张", "value": 2 },
      { "label": "空", "value": 3 }
    ]
  },
  "confirmAction": {
    "abilityId": "create_dictionary"
  }
}
```

二次确认由 Schema 声明，渲染层根据 `requiresConfirmation` 渲染确认组件。真正确认点击后的逻辑由组件内部处理。

确认卡片交互要求：

- 默认状态为待确认。
- 点击确认后进入执行中状态，并禁用确认/取消按钮。
- 点击取消后进入已取消状态，不调用原子能力。
- 已取消的确认卡片不能重复确认；用户需要重新发起业务请求。
- 确认卡片必须展示结构化参数，避免用户在不理解影响的情况下执行写操作。

### 7.3 表单

```json
{
  "type": "form",
  "title": "创建 SKU",
  "jsonSchema": {
    "type": "object",
    "required": ["name", "code", "category"],
    "properties": {
      "name": { "type": "string", "title": "SKU 名称" },
      "code": { "type": "string", "title": "SKU 编码" },
      "category": { "type": "string", "title": "类目" }
    }
  },
  "uiSchema": {
    "fields": {
      "name": { "component": "input" },
      "code": { "component": "input" },
      "category": { "component": "select" }
    }
  },
  "submitAction": {
    "abilityId": "create_sku"
  }
}
```

标准表单可以通过 `submitAction` 声明调用原子能力；自定义组件内部的提交逻辑由组件自行处理。

### 7.4 跳转链接

```json
{
  "type": "link-card",
  "title": "创建知识库",
  "description": "该流程较复杂，将跳转到知识库系统继续完成。",
  "href": "/knowledge-base/create?from=ai-facade"
}
```

### 7.5 混合内容

```json
{
  "type": "mixed",
  "blocks": []
}
```

## 8. MVP 示例对应关系

| 场景 | 推荐渲染类型 |
| --- | --- |
| 创建字典 | `mixed`，包含 `form` 与 `component` |
| 创建 SKU | `confirmation` |
| 创建知识库 | `link-card` |
| 查询用户信息 | `description` 或 `mixed` |
| 普通问答 | `message` |
