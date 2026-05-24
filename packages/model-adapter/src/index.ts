import type {
  ModelAdapter,
  ModelChatInput,
  ModelChatResult,
  ModelJudgeInput,
  ModelJudgeResult,
  SkillCandidate
} from '@eff-facade/core'

const BUSINESS_ABILITY_IDS = {
  createSku: 'create_sku',
  openKnowledgeBaseCreate: 'open_knowledge_base_create',
  getUserProfile: 'get_user_profile'
} as const

export interface MockModelAdapterOptions {
  fallbackAnswer?: string
}

export const createMockModelAdapter = (
  options: MockModelAdapterOptions = {}
): ModelAdapter => ({
  type: 'mock',
  chat: async (input) => mockChat(input, options),
  judge: async (input) => mockJudge(input)
})

const mockChat = async (
  input: ModelChatInput,
  options: MockModelAdapterOptions
): Promise<ModelChatResult> => ({
  content:
    options.fallbackAnswer ??
    `这是 Mock Model Adapter 的普通问答回复：${input.rawText}`
})

const mockJudge = async (
  input: ModelJudgeInput
): Promise<ModelJudgeResult> => {
  const normalized = input.rawText.toLowerCase()
  const businessMatch = matchBusinessAbility(normalized, input.candidates)

  if (businessMatch) {
    return {
      skillId: businessMatch.skillId,
      abilityId: businessMatch.abilityId,
      params: parseBusinessParams(input.rawText, businessMatch.abilityId),
      confidence: 0.92
    }
  }

  const dictionaryCandidate = input.candidates.find((candidate) =>
    matchesDictionaryIntent(normalized, candidate)
  )

  if (dictionaryCandidate?.abilityIds?.[0]) {
    return {
      skillId: dictionaryCandidate.skillId,
      abilityId: dictionaryCandidate.abilityIds[0],
      params: parseDictionaryParams(input.rawText),
      confidence: 0.95
    }
  }

  return {
    fallbackToChat: true,
    confidence: 0
  }
}

const matchBusinessAbility = (
  rawText: string,
  candidates: SkillCandidate[]
) => {
  const businessCandidate = candidates.find((candidate) =>
    candidate.abilityIds?.some((abilityId) =>
      Object.values(BUSINESS_ABILITY_IDS).includes(
        abilityId as (typeof BUSINESS_ABILITY_IDS)[keyof typeof BUSINESS_ABILITY_IDS]
      )
    )
  )

  if (!businessCandidate) {
    return undefined
  }

  if (rawText.includes('sku')) {
    return {
      skillId: businessCandidate.skillId,
      abilityId: BUSINESS_ABILITY_IDS.createSku
    }
  }

  if (rawText.includes('知识库') || rawText.includes('knowledge')) {
    return {
      skillId: businessCandidate.skillId,
      abilityId: BUSINESS_ABILITY_IDS.openKnowledgeBaseCreate
    }
  }

  if (rawText.includes('用户') || rawText.includes('user')) {
    return {
      skillId: businessCandidate.skillId,
      abilityId: BUSINESS_ABILITY_IDS.getUserProfile
    }
  }

  return undefined
}

const matchesDictionaryIntent = (rawText: string, candidate: SkillCandidate) => {
  const hasDictionaryAbility = candidate.abilityIds?.some(
    (abilityId) => abilityId === 'create_dictionary'
  )

  return (
    Boolean(hasDictionaryAbility) &&
    (rawText.includes('dictionary') || rawText.includes('字典'))
  )
}

const parseBusinessParams = (rawText: string, abilityId: string) => {
  if (abilityId === BUSINESS_ABILITY_IDS.createSku) {
    const explicitSkuCode = rawText.match(/编码\s*(sku[-_\da-z]*)/i)?.[1]
    const fallbackSkuCode = rawText.match(/sku[-_\da-z]*/i)?.[0]

    return {
      skuCode: (explicitSkuCode ?? fallbackSkuCode)?.toUpperCase(),
      skuName: rawText.match(/名称\s*([\u4e00-\u9fa5a-zA-Z0-9_-]+)/)?.[1]
    }
  }

  if (abilityId === BUSINESS_ABILITY_IDS.getUserProfile) {
    return {
      userId: rawText.match(/[uU]\d+/)?.[0]?.toLowerCase()
    }
  }

  return {}
}

const parseDictionaryParams = (rawText: string) => {
  const code = rawText.match(/[a-z][a-z0-9_]+/i)?.[0]
  const itemMatches = Array.from(rawText.matchAll(/([\u4e00-\u9fa5]+)\s*[:：]?\s*(\d+)/g))

  return {
    code,
    items: itemMatches.map((match) => ({
      label: match[1],
      value: Number(match[2])
    }))
  }
}
