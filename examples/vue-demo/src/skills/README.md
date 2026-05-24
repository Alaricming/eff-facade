# Vue Demo Skills

本目录是 EFF Facade MVP 的业务 Skill 参考样板。

这些 Skill 模拟“宿主项目中的业务能力”，不是 Facade runtime 的内置能力。

## 目录结构

```text
src/skills/
  agent.json
  dictionary-skill/
    skill.md
    mcp.json
    apis/
      create-dictionary.ts
      request.ts
    components/
      DictionaryPreview.vue
  business-skill/
    skill.md
    mcp.json
    apis/
      create-sku.ts
      get-user-profile.ts
      open-knowledge-base-create.ts
      request.ts
```

## agent.json

`agent.json` 注册宿主项目中所有可被 Facade 发现的 Skill。

当前注册：

- `dictionary-skill`
- `business-skill`

## dictionary-skill

验证能力：

- 自然语言创建字典。
- 模型提取字典编码和枚举项。
- 下发标准 Schema UI 表单。
- 混合渲染自定义组件 `dictionary_preview`。
- 表单提交后通过 `ctx.adapters.http.request` 调用 Mock Server。

对应场景：

```text
创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3
```

返回类型：

- 初始调用：`mixed`
- mixed block 1：`form`
- mixed block 2：`component`
- 表单提交后：`message`

## business-skill

验证能力：

- `create_sku`：确认卡。
- `open_knowledge_base_create`：复杂业务跳转链接。
- `get_user_profile`：信息查询与结构化展示。

对应场景：

```text
创建一个 SKU，编码 SKU-001，名称 蓝牙耳机
我想创建一个知识库
查看用户 u1001 的当前信息
```

返回类型：

- 创建 SKU：`confirmation` -> `message`
- 创建知识库：`link-card`
- 查询用户：`mixed`，包含 `description` 和 `table`

## request.ts

每个 Skill 内部都有局部 `request.ts`，用于封装 adapter 缺失处理：

```ts
if (!ctx.adapters.http.request) {
  throw new Error('HTTP adapter is not configured.')
}
```

这样可以保持 core 协议中的 `http.request` 可选，同时让业务 Skill 显式声明运行依赖。

## 编写新 Skill 的建议

- 先写 `skill.md`，确保意图、示例表达、参数和结果清楚。
- 再写 `mcp.json`，注册所有原子能力和组件。
- 每个 `apis/*.ts` 只做一个原子能力。
- 优先返回标准 Schema UI；只有标准表达不足时才注册自定义组件。
- 自定义组件由宿主项目编译，可以使用宿主项目自己的依赖。

## 示例 Skill 对齐检查

新增或修改示例 Skill 时，需要检查：

- `agent.json.skills[].id` 与对应 `mcp.json.id` 一致。
- `agent.json.skills[].path` 指向真实 Skill 目录。
- `mcp.json.skillDoc` 指向真实 `skill.md`。
- `mcp.json.abilities[].entry` 文件存在。
- `mcp.json.abilities[].exportName` 与 `apis/*.ts` 导出函数一致。
- `mcp.json.abilities[].renderType` 与主要返回类型一致。
- `mcp.json.components[].id` 与 result 中的 `componentId` 一致。
- `skill.md` 包含典型表达、输入参数、原子能力、结果、不适用场景和风险等级。
- 写操作需要二次确认或用户显式提交动作。
- 原子能力通过 `ctx.adapters.http.request` 访问后端，并处理 adapter 缺失。

可以运行：

```bash
pnpm --filter @eff-facade/vue-demo validate:skills
```

## 当前示例矩阵

| 场景 | Skill | Ability | 主要返回类型 | 用户动作 |
| --- | --- | --- | --- | --- |
| 创建字典 | `dictionary-skill` | `create_dictionary` | `mixed(form + component)` | 提交表单 |
| 创建 SKU | `business-skill` | `create_sku` | `confirmation` | 二次确认 |
| 创建知识库 | `business-skill` | `open_knowledge_base_create` | `link-card` | 打开链接 |
| 查询用户信息 | `business-skill` | `get_user_profile` | `mixed(description + table)` | 无 |

完整开发流程见：

```text
prd/business-skill-developer-guide.md
```
