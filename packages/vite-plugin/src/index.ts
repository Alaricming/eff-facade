import type { AgentManifest, SkillManifest } from '@eff-facade/core'
import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join, normalize, resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

const VIRTUAL_MODULE_ID = 'virtual:eff-facade/skills'
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

export interface EffFacadePluginOptions {
  skillRoot?: string
}

interface LoadedSkill {
  manifest: SkillManifest
  skillDoc: string
  abilityImports: string[]
  componentImports: string[]
}

export const effFacadePlugin = (
  options: EffFacadePluginOptions = {}
): Plugin => {
  let config: ResolvedConfig

  return {
    name: 'eff-facade',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }

      return null
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) {
        return null
      }

      const skillRoot = resolveSkillRoot(config.root, options.skillRoot)
      return generateSkillRegistryModule(skillRoot)
    }
  }
}

const resolveSkillRoot = (root: string, skillRoot = 'src/skills') => {
  if (isAbsolute(skillRoot)) {
    return normalize(skillRoot)
  }

  return normalize(resolve(root, skillRoot))
}

const generateSkillRegistryModule = (skillRoot: string) => {
  const agentPath = join(skillRoot, 'agent.json')

  if (!existsSync(agentPath)) {
    throw new Error(`[eff-facade] Missing agent manifest: ${agentPath}`)
  }

  const agent = readJsonFile<AgentManifest>(agentPath)

  const enabledSkills = agent.skills.filter((skill) => skill.enabled !== false)
  const loadedSkills = enabledSkills.map((skill) =>
    loadSkill(skillRoot, skill.path)
  )

  const imports = loadedSkills
    .flatMap((skill) => [...skill.abilityImports, ...skill.componentImports])
    .join('\n')

  const skills = loadedSkills
    .map((skill) => {
      const abilities = (skill.manifest.abilities ?? [])
        .map((ability) => {
          const importName = toImportName('ability', skill.manifest.id, ability.id)
          const exportName = JSON.stringify(ability.exportName ?? 'default')

          return `{
            manifest: ${JSON.stringify(ability)},
            load: async () => {
              const module = await ${importName}()
              return module[${exportName}] ?? module.default
            }
          }`
        })
        .join(',\n')

      const components = (skill.manifest.components ?? [])
        .map((component) => {
          const importName = toImportName(
            'component',
            skill.manifest.id,
            component.id
          )

          return `{
            manifest: ${JSON.stringify(component)},
            load: async () => {
              const module = await ${importName}()
              return module.default ?? module
            }
          }`
        })
        .join(',\n')

      return `{
        manifest: ${JSON.stringify(skill.manifest)},
        skillDoc: ${JSON.stringify(skill.skillDoc)},
        abilities: [${abilities}],
        components: [${components}]
      }`
    })
    .join(',\n')

  return `${imports}

export const skillRegistry = {
  agent: ${JSON.stringify(agent)},
  skills: [${skills}]
}

export default skillRegistry
`
}

const loadSkill = (skillRoot: string, skillPath: string): LoadedSkill => {
  const resolvedSkillPath = normalize(resolve(skillRoot, skillPath))
  const mcpPath = join(resolvedSkillPath, 'mcp.json')

  if (!existsSync(mcpPath)) {
    throw new Error(`[eff-facade] Missing skill manifest: ${mcpPath}`)
  }

  const manifest = readJsonFile<SkillManifest>(mcpPath)

  const skillDocPath = resolve(resolvedSkillPath, manifest.skillDoc)

  if (!existsSync(skillDocPath)) {
    throw new Error(`[eff-facade] Missing skill doc: ${skillDocPath}`)
  }

  const abilityImports = (manifest.abilities ?? []).map((ability) => {
    const importName = toImportName('ability', manifest.id, ability.id)
    const entry = toImportPath(resolve(resolvedSkillPath, ability.entry))
    return `const ${importName} = () => import(${JSON.stringify(entry)})`
  })

  const componentImports = (manifest.components ?? []).map((component) => {
    const importName = toImportName('component', manifest.id, component.id)
    const entry = toImportPath(resolve(resolvedSkillPath, component.entry))
    return `const ${importName} = () => import(${JSON.stringify(entry)})`
  })

  return {
    manifest,
    skillDoc: readFileSync(skillDocPath, 'utf-8'),
    abilityImports,
    componentImports
  }
}

const readJsonFile = <T>(filePath: string): T => {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[eff-facade] Failed to read JSON file ${filePath}: ${message}`)
  }
}

const toImportPath = (filePath: string) => normalize(filePath)

const toImportName = (prefix: string, skillId: string, id: string) =>
  `${prefix}_${sanitizeIdentifier(skillId)}_${sanitizeIdentifier(id)}`

const sanitizeIdentifier = (value: string) =>
  value.replace(/[^a-zA-Z0-9_$]/g, '_')

export const effFacadeVirtualModuleId = VIRTUAL_MODULE_ID

export type { AgentManifest, SkillManifest }
