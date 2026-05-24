# Skill 包目录规范

## 1. 定位

Skill 是 AI Facade 的业务能力封装单元。

一个 Skill 不只是单个配置对象，而是一个可以包含命中描述、API 能力、自定义组件和注册清单的业务能力包。

Facade 负责加载、识别、运行 Skill，并将运行结果下行到会话或 Workbench。Skill 负责封装具体业务逻辑。

## 2. 设计原则

- Facade 只关心标准协议，不关心业务内部实现。
- 业务方负责封装原子能力和可选自定义组件。
- Skill 需要有可被模型理解的描述信息。
- Skill 可以使用内置 Schema UI，也可以注册自定义组件。
- 第一版在示例宿主项目中内置几个示例 Skill，用于验证协议和 Runtime。

## 3. 宿主项目推荐目录结构

```text
src/
  skills/
    agent.json
    some-skill/
      skill.md
      mcp.json
      apis/
        create-dictionary.ts
        create-sku.ts
        query-user.ts
      components/
        SkuCreateForm.vue
        UserProfileCard.vue
```

`agent.json` 负责注册当前宿主项目有哪些 Skill；每个 Skill 的 `mcp.json` 负责注册该 Skill 内部所有内容。

## 4. `skill.md`

`skill.md` 是 Skill 的根级标准信息文件，用于 Skill 命中、模型理解和产品说明。

建议包含：

- Skill 名称。
- Skill ID。
- 能力描述。
- 适用场景。
- 不适用场景。
- 典型用户表达。
- 关键词。
- 输入参数说明。
- 结果说明。
- 风险等级。

示例：

```md
# 创建字典

## Skill ID

create_dictionary

## 描述

用于创建业务字典和字典枚举项。

## 典型表达

- 创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3
- 新增字典 order_status

## 输入参数

- code: 字典编码
- items: 字典枚举项列表

## 结果

创建成功后返回字典 ID、字典编码和枚举项。
```

## 5. `mcp.json`

`mcp.json` 是 Skill 的注册清单，用于声明 Skill 中可被 Facade 发现和运行的所有内容。

第一版建议包含：

- Skill 基础元信息。
- 原子能力注册。
- 原子组件注册。
- 默认渲染策略。

示例：

```json
{
  "id": "dictionary-skill",
  "name": "字典管理 Skill",
  "version": "0.1.0",
  "abilities": [
    {
      "id": "create_dictionary",
      "title": "创建字典",
      "entry": "./apis/create-dictionary.ts",
      "renderType": "confirmation"
    }
  ],
  "components": [
    {
      "id": "user_profile_card",
      "entry": "./components/UserProfileCard.vue"
    }
  ]
}
```

## 6. `apis/xxx.ts`

`apis/xxx.ts` 中封装 Skill 的业务原子能力。

原子能力是 Skill 中可被模型调用的最小业务执行单元。

原子能力最终以 `export async function` 的形式导出。

Facade 的预期行为：

- 根据 Skill 命中结果找到对应原子能力。
- 将用户输入、提取参数、用户上下文、Adapter 上下文传入原子能力。
- 执行原子能力。
- 接收标准返回结果。
- 根据返回结果下行消息、渲染 UI 或触发跳转。

原子能力内部可以：

- 调用 Mock Server。
- 调用宿主项目服务。
- 调用业务系统接口。
- 组合多个后端接口。
- 返回 Schema UI。
- 返回自定义组件渲染请求。
- 返回跳转链接。
- 返回中间态和自然语言描述。

## 7. `components/xxx.vue`

`components/xxx.vue` 是 Skill 可选的自定义组件。

适用场景：

- 内置 Schema UI 无法表达。
- 业务展示高度定制。
- 查询结果需要复杂交互。
- 后续需要承载较复杂的业务片段。

第一版支持自定义组件注册，但建议 MVP 优先使用内置 Schema UI，降低运行时复杂度。

## 8. Skill 命中流程

第一版采用两段式命中：

1. 基于 `skill.md` 做规则、关键词、示例表达的候选召回。
2. 将候选 Skill 的关键信息交给大模型进行意图判断和参数提取。

若未命中任何业务 Skill：

- 进入普通问答。
- 普通问答不执行写操作。

Skill 装载机制详见 [skill-loading.md](./skill-loading.md)。

协议字段详见 [protocol-v0.1.md](./protocol-v0.1.md)。

## 9. Skill 运行边界

Facade 负责：

- Skill 加载。
- Skill 识别。
- 原子能力调用。
- 运行上下文传递。
- 运行结果接收。
- 消息下行。
- UI 渲染。
- 错误展示。

Skill 负责：

- 业务参数处理。
- 原子能力封装。
- 业务接口调用。
- 自定义组件实现。
- 返回符合 Facade 协议的结果。

## 10. 第一版示例 Skill

示例宿主项目 `src/skills` 中当前收敛为两个参考 Skill：

- `dictionary-skill`：验证自然语言参数提取、生成式表单、自定义组件混合渲染、Mock Server 保存。
- `business-skill`：验证创建 SKU 二次确认、知识库复杂业务跳转、用户查询结构化展示。

当前示例对应关系：

| 场景 | Skill | 原子能力 | 渲染类型 |
| --- | --- | --- | --- |
| 创建字典 | `dictionary-skill` | `create_dictionary` | `mixed(form + component)` |
| 创建 SKU | `business-skill` | `create_sku` | `confirmation` |
| 创建知识库 | `business-skill` | `open_knowledge_base_create` | `link-card` |
| 查询用户信息 | `business-skill` | `get_user_profile` | `mixed(description + table)` |
