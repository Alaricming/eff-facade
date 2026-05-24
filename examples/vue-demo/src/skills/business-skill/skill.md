# 业务操作 Skill

## Skill ID

business-skill

## 描述

用于验证 EFF Facade MVP 中的复杂业务跳转、信息查询展示、二次确认操作。

## 典型表达

- 创建一个 SKU，编码 SKU-001，名称 蓝牙耳机
- 创建知识库
- 查看用户 u1001 的当前信息

## 输入参数

- skuCode: SKU 编码
- skuName: SKU 名称
- userId: 用户 ID

## 原子能力

- create_sku: 创建 SKU 前返回二次确认卡。
- open_knowledge_base_create: 返回知识库创建页面链接。
- get_user_profile: 查询用户当前信息并展示结构化结果。

## 结果

- 创建 SKU 返回 `confirmation`，用户确认后返回 `message`。
- 创建知识库返回 `link-card`，由宿主 router 打开业务页面。
- 查询用户返回 `mixed`，包含 `description` 和 `table`。

## 不适用场景

- 不承载复杂知识库创建表单，只负责跳转。
- 不修改用户信息。
- 不处理真实权限、审计或字段脱敏。

## 风险等级

medium。`create_sku` 是写操作，需要二次确认；知识库跳转和用户查询在 MVP 中使用 Mock 数据。
