---
name: eff-facade-skill
description: Project-specific development rules for the EFF Facade codebase. Use when modifying, adding, reviewing, or planning code in this repository, especially packages, Vue renderer, Runtime, Schema UI, Skill loading, Workbench UI, Tailwind styling, design tokens, or icon usage.
---

# EFF Facade Project Development

Use this skill whenever working on this repository.

## Core Rules

- Keep responsibilities single and explicit.
- Treat documentation as the source of truth for architecture and roadmap:
  - When adding or changing architecture, package boundaries, protocol shape, runtime behavior, rendering strategy, or integration strategy, update the relevant `prd/` design or planning document before editing code.
  - Do not make substantial implementation changes based only on an in-chat idea; first record the decision, scope, migration steps, and verification criteria.
  - Keep implementation aligned with the latest PRD. If code and PRD disagree, pause and reconcile the document first.
- Keep package boundaries clean:
  - `core`: protocol types and shared contracts only.
  - `runtime`: framework-agnostic execution and state.
  - `schema-ui`: schema parsing and render-model logic.
  - `vue-renderer`: Vue UI and presentation.
  - `model-adapter`: model provider adapters.
  - `skill-loader`: registry validation and lookup.
  - `vite-plugin`: build-time Skill discovery only.
  - `facade`: public runtime entrypoint, no Node-only code.
- Do not put Node-only code into browser-facing packages.
- Prefer small functions with clear inputs and outputs.
- Avoid broad abstractions until a repeated pattern exists.
- Keep public APIs typed and aligned with `prd/protocol-v0.1.md`.

## Constants

- Extract repeated literals, ids, class groups, status lists, result type lists, route names, virtual module ids, and package names into constants.
- Prefer colocated constants when only one module uses them.
- Promote constants to shared files only when at least two modules need them.
- Do not duplicate protocol strings such as result types, task statuses, schema version, or virtual module ids.

## Styling

- Use Tailwind CSS for project UI styling.
- Do not add ad hoc CSS systems for application UI.
- Define design tokens before building complex UI:
  - color tokens
  - radius tokens
  - spacing rhythm
  - typography scale
  - shadow/elevation
  - border colors
- Build a consistent EFF Facade UI language from these tokens.
- Prefer semantic token names over raw color intent, for example `surface`, `muted`, `accent`, `border`, `danger`.
- Keep MVP light theme only unless explicitly asked otherwise.

## Icons

- Use `@iconify/vue` as the only icon solution for Vue UI.
- Do not introduce other icon libraries.
- Do not hand-roll SVG icons when an Iconify icon exists.
- Centralize icon names as constants when reused.

## Vue Guidance

- Keep Vue components focused:
  - shell/layout components handle layout.
  - message components render messages.
  - schema components render schema blocks.
  - drawer components render auxiliary panels.
- Keep business execution out of Vue components unless it is explicitly component-owned interaction.
- Access runtime capability through `facadeContext` or runtime props, not hidden globals.

## Validation

Before stopping after code changes:

- Run the narrowest relevant typecheck/build command.
- For UI-visible work, run the Vue demo and verify in browser.
- Report any command that could not be run.
