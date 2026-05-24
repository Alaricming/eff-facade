import {
  EFF_FACADE_PROTOCOL_VERSION,
  type RegisteredAbility,
  type RegisteredComponent,
  type RegisteredSkill,
  type SkillRegistry
} from '@eff-facade/core'

export interface SkillLoader {
  registry: SkillRegistry
  getSkills: () => RegisteredSkill[]
  getAbility: (abilityId: string) => RegisteredAbility | undefined
  getComponent: (componentId: string) => RegisteredComponent | undefined
}

export const createSkillLoader = (registry: SkillRegistry): SkillLoader => {
  validateSkillRegistry(registry)

  return {
    registry,
    getSkills: () => registry.skills,
    getAbility: (abilityId) =>
      registry.skills
        .flatMap((skill) => skill.abilities)
        .find((ability) => ability.manifest.id === abilityId),
    getComponent: (componentId) =>
      registry.skills
        .flatMap((skill) => skill.components)
        .find((component) => component.manifest.id === componentId)
  }
}

export const validateSkillRegistry = (registry: SkillRegistry) => {
  if (registry.agent.schemaVersion !== EFF_FACADE_PROTOCOL_VERSION) {
    throw new Error(
      `[eff-facade] Unsupported agent schema version: ${registry.agent.schemaVersion}`
    )
  }

  for (const skill of registry.skills) {
    if (skill.manifest.schemaVersion !== EFF_FACADE_PROTOCOL_VERSION) {
      throw new Error(
        `[eff-facade] Unsupported skill schema version for ${skill.manifest.id}: ${skill.manifest.schemaVersion}`
      )
    }
  }
}

