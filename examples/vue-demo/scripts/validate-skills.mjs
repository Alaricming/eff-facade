import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const skillRoot = normalize(join(root, '../src/skills'))
const agentPath = join(skillRoot, 'agent.json')

const requiredSkillDocSections = [
  '## Skill ID',
  '## 描述',
  '## 典型表达',
  '## 输入参数',
  '## 原子能力',
  '## 结果',
  '## 不适用场景',
  '## 风险等级'
]

const errors = []

const readJson = (filePath) => {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch (error) {
    errors.push(`Failed to read JSON: ${filePath} (${error.message})`)
    return undefined
  }
}

const assertFile = (filePath, label) => {
  if (!existsSync(filePath)) {
    errors.push(`Missing ${label}: ${filePath}`)
    return false
  }

  return true
}

const readText = (filePath) => readFileSync(filePath, 'utf-8')

const assertExport = (filePath, exportName) => {
  const source = readText(filePath)
  const namedExportPattern = new RegExp(
    `export\\s+async\\s+function\\s+${escapeRegExp(exportName)}\\b`
  )

  if (!namedExportPattern.test(source)) {
    errors.push(`Missing export async function ${exportName}: ${filePath}`)
  }
}

const assertIncludes = (source, expected, filePath) => {
  if (!source.includes(expected)) {
    errors.push(`Missing "${expected}" in ${filePath}`)
  }
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

if (assertFile(agentPath, 'agent.json')) {
  const agent = readJson(agentPath)

  if (agent) {
    for (const skillRef of agent.skills ?? []) {
      const skillPath = join(skillRoot, skillRef.path)
      const mcpPath = join(skillPath, 'mcp.json')

      if (!assertFile(mcpPath, `mcp.json for ${skillRef.id}`)) {
        continue
      }

      const manifest = readJson(mcpPath)
      if (!manifest) {
        continue
      }

      if (manifest.id !== skillRef.id) {
        errors.push(
          `Skill id mismatch: agent has ${skillRef.id}, mcp has ${manifest.id}`
        )
      }

      const skillDocPath = join(skillPath, manifest.skillDoc ?? 'skill.md')
      if (assertFile(skillDocPath, `skill.md for ${skillRef.id}`)) {
        const skillDoc = readText(skillDocPath)
        for (const section of requiredSkillDocSections) {
          assertIncludes(skillDoc, section, skillDocPath)
        }
      }

      for (const ability of manifest.abilities ?? []) {
        const abilityPath = join(skillPath, ability.entry)
        if (assertFile(abilityPath, `ability ${ability.id}`)) {
          assertExport(abilityPath, ability.exportName ?? 'default')
        }
      }

      for (const component of manifest.components ?? []) {
        const componentPath = join(skillPath, component.entry)
        assertFile(componentPath, `component ${component.id}`)
      }
    }
  }
}

if (errors.length > 0) {
  console.error('[eff-facade] Skill validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('[eff-facade] Skill validation passed.')
