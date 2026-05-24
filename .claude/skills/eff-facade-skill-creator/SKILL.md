---
name: eff-facade-skill-creator
description: Help create EFF Facade business Skills in host projects, including src/skills/agent.json, skill.md, mcp.json, apis/*.ts atomic abilities, and components/*.vue custom components.
---

# EFF Facade Business Skill Creator

Use this skill when creating or updating business Skills for a project that integrates EFF Facade.

This is a tool-facing development skill. It is not part of the EFF Facade runtime, Vite plugin, or `@eff-facade/facade` dependency graph.

Use `prd/business-skill-developer-guide.md` as the canonical project guide when it is available in the repository.

## Boundaries

- Create business Skills in the host project, usually under `src/skills`.
- Do not add business Skills into Facade core packages.
- Do not add `eff-facade-skill-creator` as a runtime dependency.
- Keep `skill.md` model-readable and concise.

## Structure

```text
src/
  skills/
    agent.json
    some-skill/
      skill.md
      mcp.json
      apis/
        some-ability.ts
      components/
        SomeComponent.vue
```

## Required Files

- `src/skills/agent.json`: registers all Skills in one host project.
- `skill.md`: describes intent matching, examples, params, and results.
- `mcp.json`: registers atomic abilities and custom components.
- `apis/*.ts`: atomic abilities exported as `export async function`.
- `components/*.vue`: optional host-compiled custom components.

## Rules

- Register each Skill in `src/skills/agent.json`.
- Register each atomic ability and component in the Skill `mcp.json`.
- Use `entry` paths relative to the Skill directory.
- Keep one atomic ability focused on one business capability.
- Use `ctx.adapters.http.request` for backend calls, with missing-adapter handling.
- Prefer standard Schema UI results before custom components.
- Use `input.source === 'component'` to distinguish form or confirmation submissions from initial model calls.
- Use `submitAction.abilityId` and `confirmAction.abilityId` to call registered atomic abilities.
- Use `x-*` keys for experimental manifest extensions.

## Result Types

Use these standard result types:

- `message`
- `form`
- `confirmation`
- `description`
- `table`
- `link-card`
- `component`
- `mixed`
- `error`

## Atomic Ability Pattern

```ts
import type { AtomicAbilityInput, FacadeContext } from '@eff-facade/facade'

export async function queryUser(ctx: FacadeContext, input: AtomicAbilityInput) {
  return {
    type: 'description',
    status: 'done',
    title: '用户信息',
    data: {
      rawText: input.rawText
    }
  } as const
}
```

## Reference Demo Skills

- `examples/vue-demo/src/skills/dictionary-skill`: form + custom component + mock server save.
- `examples/vue-demo/src/skills/business-skill`: confirmation, link-card, description/table mixed result.
