---
name: eff-facade-skill-creator
description: Help users create real business Skills for EFF Facade host projects. Use when creating or updating src/skills/agent.json, skill.md, mcp.json, apis/*.ts atomic abilities, or components/*.vue custom components for an application integrating @eff-facade/facade.
---

# EFF Facade Business Skill Creator

This package keeps the source copy of the `eff-facade-skill-creator` tool skill.

Install or copy this skill into coding-agent tool directories such as:

- `.codex/skills/eff-facade-skill-creator/SKILL.md`
- `.claude/skills/eff-facade-skill-creator/SKILL.md`

This skill is not part of the EFF Facade runtime, Vite plugin, or `@eff-facade/facade` dependency graph.

Use `prd/business-skill-developer-guide.md` as the canonical project guide when it is available in the repository.

## Scope

Use it to help create business Skills under a host project:

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

## Rules

- Register every Skill in `agent.json`.
- Register every atomic ability and component in `mcp.json`.
- Export atomic abilities as `export async function`.
- Keep `skill.md` focused on model-readable matching information.
- Prefer Schema UI results before custom components.
- Use `input.source === 'component'` for form or confirmation submissions.
- Use `submitAction.abilityId` and `confirmAction.abilityId` for registered ability calls.
- Let the host project compile custom components and their UI dependencies.
- Use `x-*` keys for experimental manifest extensions.

## Reference

The fuller project-local Codex copy is:

```text
.codex/skills/eff-facade-skill-creator/SKILL.md
```
