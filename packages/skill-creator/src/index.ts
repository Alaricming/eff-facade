import {
  EFF_FACADE_PROTOCOL_VERSION,
  type AgentManifest,
  type AtomicAbilityManifest,
  type AtomicAbilityRenderType,
  type AtomicComponentManifest,
  type AtomicComponentType,
  type RiskLevel,
  type SkillManifest
} from '@eff-facade/core'

export const EFF_FACADE_SKILL_CREATOR_NAME = 'eff-facade-skill-creator'

export const DEFAULT_SKILL_ROOT = 'src/skills'

export const BUSINESS_SKILL_FILES = {
  agent: 'agent.json',
  skillDoc: 'skill.md',
  manifest: 'mcp.json',
  apisDir: 'apis',
  componentsDir: 'components'
} as const

export const BUSINESS_SKILL_RULES = [
  'Define all exposed business capabilities as atomic abilities under apis/.',
  'Register every atomic ability and component in mcp.json.',
  'Keep skill.md focused on matching, usage examples, and model-readable intent.',
  'Do not add fields outside the EFF Facade protocol unless they use x-* extension keys.',
  'Use facadeContext for component-to-runtime interaction.',
  'Prefer Schema UI before custom components.',
  'Let host project dependencies compile custom components.'
] as const

export interface CreateBusinessSkillInput {
  id: string
  name: string
  description?: string
  riskLevel?: RiskLevel
  examples?: string[]
  keywords?: string[]
  abilities?: CreateBusinessAbilityInput[]
  components?: CreateBusinessComponentInput[]
}

export interface CreateBusinessAbilityInput {
  id: string
  title: string
  description?: string
  renderType?: AtomicAbilityRenderType
  requiresConfirmation?: boolean
  riskLevel?: RiskLevel
}

export interface CreateBusinessComponentInput {
  id: string
  title?: string
  componentType?: AtomicComponentType
  fileName?: string
}

export interface BusinessSkillDraft {
  skillDir: string
  files: Record<string, string>
  manifest: SkillManifest
}

export interface CreateAgentManifestInput {
  id: string
  name: string
  description?: string
  version?: string
  skills: Array<{
    id: string
    path?: string
    enabled?: boolean
  }>
}

export interface SkillValidationIssue {
  level: 'error' | 'warning'
  path: string
  message: string
}

export interface SkillValidationResult {
  valid: boolean
  issues: SkillValidationIssue[]
}

export const createBusinessSkillDraft = (
  input: CreateBusinessSkillInput
): BusinessSkillDraft => {
  const abilities = normalizeAbilities(input)
  const components = input.components ?? []
  const skillDir = `${DEFAULT_SKILL_ROOT}/${input.id}`
  const manifest = createSkillManifest(input, abilities, components)

  return {
    skillDir,
    manifest,
    files: {
      [BUSINESS_SKILL_FILES.skillDoc]: createSkillDoc(input, abilities),
      [BUSINESS_SKILL_FILES.manifest]: `${JSON.stringify(manifest, null, 2)}\n`,
      ...Object.fromEntries(
        abilities.map((ability) => [
          `${BUSINESS_SKILL_FILES.apisDir}/${toAbilityFileName(ability.id)}`,
          createAbilitySource(ability)
        ])
      ),
      ...Object.fromEntries(
        components.map((component) => [
          `${BUSINESS_SKILL_FILES.componentsDir}/${toComponentFileName(component)}`,
          createComponentSource(component)
        ])
      )
    }
  }
}

export const createAgentManifest = (
  input: CreateAgentManifestInput
): AgentManifest => ({
  schemaVersion: EFF_FACADE_PROTOCOL_VERSION,
  id: input.id,
  name: input.name,
  description: input.description,
  version: input.version ?? '0.0.0',
  skills: input.skills.map((skill) => ({
    id: skill.id,
    path: skill.path ?? `./${skill.id}`,
    enabled: skill.enabled ?? true
  }))
})

export const createAgentManifestSource = (input: CreateAgentManifestInput) =>
  `${JSON.stringify(createAgentManifest(input), null, 2)}\n`

export const validateAgentManifest = (
  manifest: AgentManifest
): SkillValidationResult => {
  const issues: SkillValidationIssue[] = []

  pushRequiredStringIssue(issues, manifest.schemaVersion, 'agent.schemaVersion')
  pushRequiredStringIssue(issues, manifest.id, 'agent.id')
  pushRequiredStringIssue(issues, manifest.name, 'agent.name')

  if (manifest.schemaVersion !== EFF_FACADE_PROTOCOL_VERSION) {
    issues.push({
      level: 'error',
      path: 'agent.schemaVersion',
      message: `Unsupported schema version: ${manifest.schemaVersion}`
    })
  }

  if (manifest.skills.length === 0) {
    issues.push({
      level: 'warning',
      path: 'agent.skills',
      message: 'Agent has no registered skills.'
    })
  }

  manifest.skills.forEach((skill, index) => {
    pushRequiredStringIssue(issues, skill.id, `agent.skills[${index}].id`)
    pushRequiredStringIssue(issues, skill.path, `agent.skills[${index}].path`)
  })

  return createValidationResult(issues)
}

export const validateSkillManifest = (
  manifest: SkillManifest
): SkillValidationResult => {
  const issues: SkillValidationIssue[] = []

  pushRequiredStringIssue(issues, manifest.schemaVersion, 'skill.schemaVersion')
  pushRequiredStringIssue(issues, manifest.id, 'skill.id')
  pushRequiredStringIssue(issues, manifest.name, 'skill.name')
  pushRequiredStringIssue(issues, manifest.skillDoc, 'skill.skillDoc')

  if (manifest.schemaVersion !== EFF_FACADE_PROTOCOL_VERSION) {
    issues.push({
      level: 'error',
      path: 'skill.schemaVersion',
      message: `Unsupported schema version: ${manifest.schemaVersion}`
    })
  }

  ;(manifest.abilities ?? []).forEach((ability, index) => {
    const path = `skill.abilities[${index}]`
    pushRequiredStringIssue(issues, ability.id, `${path}.id`)
    pushRequiredStringIssue(issues, ability.title, `${path}.title`)
    pushRequiredStringIssue(issues, ability.entry, `${path}.entry`)
    if (!ability.exportName) {
      issues.push({
        level: 'warning',
        path: `${path}.exportName`,
        message: 'Ability exportName is omitted; default export will be used.'
      })
    }
  })

  ;(manifest.components ?? []).forEach((component, index) => {
    const path = `skill.components[${index}]`
    pushRequiredStringIssue(issues, component.id, `${path}.id`)
    pushRequiredStringIssue(issues, component.entry, `${path}.entry`)
    pushRequiredStringIssue(issues, component.componentType, `${path}.componentType`)
  })

  if ((manifest.abilities ?? []).length === 0) {
    issues.push({
      level: 'warning',
      path: 'skill.abilities',
      message: 'Skill has no registered atomic abilities.'
    })
  }

  return createValidationResult(issues)
}

export const toAbilityFileName = (abilityId: string) =>
  `${toKebabCase(abilityId)}.ts`

export const toAbilityExportName = (abilityId: string) => toCamelCase(abilityId)

export const toComponentFileName = (component: CreateBusinessComponentInput) =>
  component.fileName ?? `${toPascalCase(component.id)}.vue`

const normalizeAbilities = (
  input: CreateBusinessSkillInput
): CreateBusinessAbilityInput[] =>
  input.abilities?.length
    ? input.abilities
    : [
        {
          id: 'run',
          title: input.name,
          description: input.description,
          renderType: 'message'
        }
      ]

const createSkillDoc = (
  input: CreateBusinessSkillInput,
  abilities: CreateBusinessAbilityInput[]
) => `# ${input.name}

## Skill ID

${input.id}

## 描述

${input.description ?? input.name}

## 典型表达

${formatList(input.examples ?? abilities.map((ability) => ability.title))}

## 关键词

${formatList(input.keywords ?? [input.name])}

## 原子能力

${formatList(abilities.map((ability) => `${ability.id}: ${ability.title}`))}

## 输入参数

- 按业务原子能力需要定义。

## 结果

- 返回 EFF Facade 原子能力结果协议。
`

const createSkillManifest = (
  input: CreateBusinessSkillInput,
  abilities: CreateBusinessAbilityInput[],
  components: CreateBusinessComponentInput[]
): SkillManifest => ({
  schemaVersion: EFF_FACADE_PROTOCOL_VERSION,
  id: input.id,
  name: input.name,
  description: input.description,
  version: '0.0.0',
  skillDoc: './skill.md',
  riskLevel: input.riskLevel ?? 'low',
  abilities: abilities.map(createAbilityManifest),
  components: components.map(createComponentManifest)
})

const createAbilityManifest = (
  ability: CreateBusinessAbilityInput
): AtomicAbilityManifest => ({
  id: ability.id,
  title: ability.title,
  description: ability.description,
  entry: `./${BUSINESS_SKILL_FILES.apisDir}/${toAbilityFileName(ability.id)}`,
  exportName: toAbilityExportName(ability.id),
  renderType: ability.renderType ?? 'message',
  requiresConfirmation: ability.requiresConfirmation ?? false,
  riskLevel: ability.riskLevel
})

const createComponentManifest = (
  component: CreateBusinessComponentInput
): AtomicComponentManifest => ({
  id: component.id,
  title: component.title,
  entry: `./${BUSINESS_SKILL_FILES.componentsDir}/${toComponentFileName(component)}`,
  componentType: component.componentType ?? 'vue'
})

const createAbilitySource = (ability: CreateBusinessAbilityInput) => `import type {
  AtomicAbilityInput,
  FacadeContext
} from '@eff-facade/facade'

export async function ${toAbilityExportName(ability.id)}(
  _ctx: FacadeContext,
  input: AtomicAbilityInput
) {
  return {
    type: '${ability.renderType ?? 'message'}',
    status: 'done',
    content: \`${ability.title}: \${input.rawText}\`
  } as const
}
`

const createComponentSource = (component: CreateBusinessComponentInput) => `<template>
  <section class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
    ${component.title ?? component.id}
  </section>
</template>
`

const formatList = (items: string[]) =>
  items.length ? items.map((item) => `- ${item}`).join('\n') : '- 待补充'

const pushRequiredStringIssue = (
  issues: SkillValidationIssue[],
  value: unknown,
  path: string
) => {
  if (typeof value !== 'string' || value.trim() === '') {
    issues.push({
      level: 'error',
      path,
      message: 'Required string is missing.'
    })
  }
}

const createValidationResult = (
  issues: SkillValidationIssue[]
): SkillValidationResult => ({
  valid: issues.every((issue) => issue.level !== 'error'),
  issues
})

const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()

const toCamelCase = (value: string) =>
  value
    .replace(/[-_\s]+(.)?/g, (_, char: string | undefined) =>
      char ? char.toUpperCase() : ''
    )
    .replace(/^[A-Z]/, (char) => char.toLowerCase())

const toPascalCase = (value: string) => {
  const camel = toCamelCase(value)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}
