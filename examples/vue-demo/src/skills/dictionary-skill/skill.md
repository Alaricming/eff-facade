# 字典管理 Skill

## Skill ID

dictionary-skill

## 描述

用于创建业务字典和字典枚举项。

## 典型表达

- 创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3
- 新增字典 order_status

## 输入参数

- code: 字典编码
- items: 字典枚举项列表

## 原子能力

- create_dictionary: 创建业务字典和枚举项。

## 结果

- 初始调用返回 `mixed`。
- `mixed.blocks[0]` 是标准 `form`，用于填写字典编码、名称、状态和描述。
- `mixed.blocks[1]` 是自定义组件 `dictionary_preview`，用于预览模型提取到的枚举项。
- 表单提交后调用 `create_dictionary`，返回 `message` 保存结果。

## 不适用场景

- 不用于修改已有字典。
- 不用于删除字典。
- 不用于查询字典详情。
- 不处理真实权限和审计。

## 风险等级

medium。该能力会创建业务数据，MVP 通过用户显式提交表单确认操作。
