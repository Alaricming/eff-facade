# EFF Facade

Company-grade AI facade for middle/back-office applications.

EFF Facade provides an embeddable AI workbench, runtime, schema-driven UI rendering, model adapters, and a host-project Skill convention. Business projects register Skills under `src/skills`, then use natural language to trigger atomic abilities, generative forms, links to existing business pages, and query result cards.

## Current Status

This repository is in MVP architecture iteration.

Implemented so far:

- pnpm monorepo structure.
- `@eff-facade/facade` as the primary public package.
- Runtime with Skill recall, model judge, ability execution, messages, tasks, and debug traces.
- Vite Skill discovery from `src/skills/agent.json`.
- Vue demo host project.
- Workbench package separated from Skill result renderer.
- Vue Skill result renderer for forms, confirmation, descriptions, tables, links, mixed blocks, errors, and custom components.
- Fastify mock server.
- Example business Skills for dictionary creation, SKU creation, knowledge-base link, user query, and fallback chat.

## Repository Layout

```text
packages/
  core/            Protocol types and shared contracts
  runtime/         Framework-agnostic execution runtime
  workbench/       Built-in Facade workbench shell
  schema-ui/       Schema parsing and form model helpers
  vue-renderer/    Vue renderer for Skill result blocks
  model-adapter/   Mock model adapter
  skill-loader/    Registry validation and lookup
  vite-plugin/     Build-time Skill discovery
  facade/          Public aggregate package
  mock-server/     Fastify mock APIs
  skill-creator/   Tool-facing Skill authoring helpers

examples/
  vue-demo/        Host project demo

prd/               Product and architecture documents
```

## Development

Install dependencies:

```bash
pnpm install
```

Run the mock server:

```bash
pnpm dev:mock
```

Run the Vue demo:

```bash
pnpm dev:vue
```

The Vue demo runs on `http://127.0.0.1:5174/`.

Validate and build:

```bash
pnpm typecheck
pnpm build
```

## Documentation

Start from:

- [Product PRD](./prd/product-prd.md)
- [Technical Architecture](./prd/technical-architecture.md)
- [Implementation Plan](./prd/implementation-plan.md)
- [Host Integration Guide](./prd/host-integration-guide.md)
- [MVP Acceptance Checklist](./prd/mvp-acceptance-checklist.md)
