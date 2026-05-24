import type {
  AtomicAbilityInput,
  AtomicAbilityResult,
  FacadeAdapters,
  FacadeContext,
  FacadeMessage,
  FacadeTask,
  FacadeUserContext,
  RegisteredAbility,
  RegisteredSkill,
  RuntimeDebugEvent,
  RuntimeDebugTrace,
  RuntimeRunResult,
  RegisteredComponent,
  SkillCandidate,
  SkillRegistry
} from '@eff-facade/core'

export interface CreateRuntimeOptions {
  registry: SkillRegistry
  adapters: FacadeAdapters
  user?: FacadeUserContext
}

export interface FacadeRuntime {
  registry: SkillRegistry
  messages: FacadeMessage[]
  tasks: FacadeTask[]
  debugTraces: RuntimeDebugTrace[]
  adapters: FacadeAdapters
  loadComponent: (componentId: string) => Promise<unknown>
  clear: () => void
  run: (rawText: string) => Promise<RuntimeRunResult>
  callAbility: (
    abilityId: string,
    input: AtomicAbilityInput
  ) => Promise<RuntimeRunResult>
}

export const createRuntime = (options: CreateRuntimeOptions): FacadeRuntime => {
  const messages: FacadeMessage[] = []
  const tasks: FacadeTask[] = []
  const debugTraces: RuntimeDebugTrace[] = []

  const runtime: FacadeRuntime = {
    registry: options.registry,
    messages,
    tasks,
    debugTraces,
    adapters: options.adapters,
    clear: () => {
      messages.splice(0, messages.length)
      tasks.splice(0, tasks.length)
      debugTraces.splice(0, debugTraces.length)
    },
    loadComponent: async (componentId) => {
      const component = findComponent(options.registry.skills, componentId)
      if (!component) {
        throw new Error(`Component not found: ${componentId}`)
      }

      return component.load()
    },
    callAbility: async (abilityId, input) => {
      const task = createTask(input.rawText)
      tasks.push(task)

      const debug = createDebugTrace(input.rawText)

      try {
        const skill = options.registry.skills.find((item) =>
          item.abilities.some((candidate) => candidate.manifest.id === abilityId)
        )
        const ability = skill?.abilities.find(
          (candidate) => candidate.manifest.id === abilityId
        )

        if (!skill || !ability) {
          throw new Error(`Ability not found: ${abilityId}`)
        }

        task.skillId = skill.manifest.id
        task.abilityId = abilityId
        task.status = 'running'
        task.updatedAt = Date.now()
        debug.selectedSkillId = skill.manifest.id
        debug.selectedAbilityId = abilityId
        debug.abilityInput = input
        appendDebugEvent(debug, 'ability', '开始调用原子能力', {
          skillId: skill.manifest.id,
          abilityId,
          source: input.source
        })

        const result = await callAbility({
          registry: options.registry,
          adapters: options.adapters,
          user: options.user,
          skill,
          ability,
          input,
          messages
        })
        const message = createMessage({
          role: 'assistant',
          result
        })

        task.status = result.status === 'error' ? 'error' : 'done'
        task.updatedAt = Date.now()
        task.summary = result.title ?? result.type
        messages.push(message)
        debug.abilityResult = result
        debug.renderType = result.type
        appendDebugEvent(debug, 'render', '原子能力返回渲染结果', {
          renderType: result.type,
          status: result.status ?? 'done'
        })
        debugTraces.push(debug)

        return {
          message,
          task,
          debug
        }
      } catch (error) {
        const messageText = error instanceof Error ? error.message : String(error)
        const result: AtomicAbilityResult = {
          type: 'error',
          status: 'error',
          message: 'Runtime 执行失败',
          detail: messageText
        }
        const message = createMessage({
          role: 'assistant',
          result
        })

        task.status = 'error'
        task.updatedAt = Date.now()
        task.summary = result.message
        messages.push(message)
        debug.error = messageText
        debug.abilityResult = result
        debug.renderType = result.type
        appendDebugEvent(debug, 'error', '原子能力执行失败', {
          error: messageText
        })
        debugTraces.push(debug)

        return {
          message,
          task,
          debug
        }
      }
    },
    run: async (rawText) => {
      const userMessage = createMessage({
        role: 'user',
        content: rawText
      })
      messages.push(userMessage)

      const task = createTask(rawText)
      tasks.push(task)

      const candidates = recallSkills(options.registry.skills, rawText)
      const debug = createDebugTrace(rawText)
      debug.candidates = candidates
      appendDebugEvent(debug, 'recall', '召回候选 Skill', {
        candidateCount: candidates.length,
        topSkillId: candidates[0]?.skillId,
        topScore: candidates[0]?.score
      })

      try {
        const judge = await options.adapters.model.judge?.({
          rawText,
          candidates
        })

        debug.selectedSkillId = judge?.skillId
        debug.selectedAbilityId = judge?.abilityId
        debug.extractedParams = judge?.params
        appendDebugEvent(debug, 'judge', '模型完成意图识别', {
          skillId: judge?.skillId,
          abilityId: judge?.abilityId,
          confidence: judge?.confidence,
          fallbackToChat: judge?.fallbackToChat ?? false
        })

        if (!judge || judge.fallbackToChat || !judge.skillId || !judge.abilityId) {
          const chat = await options.adapters.model.chat?.({
            rawText,
            messages
          })
          const message = createMessage({
            role: 'assistant',
            result: {
              type: 'message',
              status: 'done',
              content: chat?.content ?? 'Mock model fallback is not configured.'
            }
          })

          task.status = 'done'
          task.updatedAt = Date.now()
          task.summary = '普通问答'
          messages.push(message)
          debug.abilityResult = message.result
          debug.renderType = message.result?.type
          appendDebugEvent(debug, 'render', '渲染普通问答结果', {
            renderType: message.result?.type
          })
          debugTraces.push(debug)

          return {
            message,
            task,
            debug
          }
        }

        const skill = options.registry.skills.find(
          (item) => item.manifest.id === judge.skillId
        )
        const ability = skill?.abilities.find(
          (item) => item.manifest.id === judge.abilityId
        )

        if (!skill || !ability) {
          throw new Error(
            `Ability not found: ${judge.skillId}/${judge.abilityId}`
          )
        }

        task.skillId = judge.skillId
        task.abilityId = judge.abilityId
        task.status = 'running'
        task.updatedAt = Date.now()

        const abilityInput: AtomicAbilityInput = {
          rawText,
          params: judge.params,
          source: 'model',
          messageId: userMessage.id
        }
        debug.abilityInput = abilityInput
        appendDebugEvent(debug, 'ability', '开始调用命中的原子能力', {
          skillId: skill.manifest.id,
          abilityId: ability.manifest.id,
          source: abilityInput.source
        })

        const result = await callAbility({
          registry: options.registry,
          adapters: options.adapters,
          user: options.user,
          skill,
          ability,
          input: abilityInput,
          messages
        })
        debug.abilityResult = result
        debug.renderType = result.type
        appendDebugEvent(debug, 'render', '原子能力返回渲染结果', {
          renderType: result.type,
          status: result.status ?? 'done'
        })

        const message = createMessage({
          role: 'assistant',
          result
        })

        task.status = result.status === 'error' ? 'error' : 'done'
        task.updatedAt = Date.now()
        task.summary = result.title ?? result.type
        messages.push(message)
        debugTraces.push(debug)

        return {
          message,
          task,
          debug
        }
      } catch (error) {
        const messageText = error instanceof Error ? error.message : String(error)
        const result: AtomicAbilityResult = {
          type: 'error',
          status: 'error',
          message: 'Runtime 执行失败',
          detail: messageText
        }
        const message = createMessage({
          role: 'assistant',
          result
        })

        task.status = 'error'
        task.updatedAt = Date.now()
        task.summary = result.message
        messages.push(message)
        debug.error = messageText
        debug.abilityResult = result
        debug.renderType = result.type
        appendDebugEvent(debug, 'error', '运行时执行失败', {
          error: messageText
        })
        debugTraces.push(debug)

        return {
          message,
          task,
          debug
        }
      }
    }
  }

  return runtime
}

const recallSkills = (
  skills: RegisteredSkill[],
  rawText: string
): SkillCandidate[] => {
  const normalized = rawText.toLowerCase()

  return skills
    .map((skill) => {
      const skillText = [
        skill.manifest.id,
        skill.manifest.name,
        skill.manifest.description,
        skill.skillDoc
      ]
        .filter(Boolean)
        .join('\n')
        .toLowerCase()

      const score =
        scoreTextMatch(normalized, skillText) +
        skill.abilities.reduce(
          (total, ability) =>
            total +
            scoreTextMatch(
              normalized,
              [
                ability.manifest.id,
                ability.manifest.title,
                ability.manifest.description
              ]
                .filter(Boolean)
                .join('\n')
                .toLowerCase()
            ),
          0
        )

      return {
        skillId: skill.manifest.id,
        skillName: skill.manifest.name,
        abilityIds: skill.abilities.map((ability) => ability.manifest.id),
        skillDoc: skill.skillDoc,
        score,
        reason: score > 0 ? 'keyword-match' : 'registered-skill'
      }
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

const scoreTextMatch = (rawText: string, targetText: string) => {
  const tokens = rawText
    .split(/[\s,，。:：]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  return tokens.reduce(
    (score, token) => score + (targetText.includes(token) ? 1 : 0),
    0
  )
}

const findComponent = (
  skills: RegisteredSkill[],
  componentId: string
): RegisteredComponent | undefined => {
  for (const skill of skills) {
    const component = skill.components.find(
      (candidate) => candidate.manifest.id === componentId
    )
    if (component) {
      return component
    }
  }

  return undefined
}

const createDebugTrace = (input: string): RuntimeDebugTrace => ({
  input,
  events: [
    {
      stage: 'input',
      label: '接收用户输入',
      timestamp: Date.now()
    }
  ],
  candidates: []
})

const appendDebugEvent = (
  trace: RuntimeDebugTrace,
  stage: RuntimeDebugEvent['stage'],
  label: string,
  detail?: RuntimeDebugEvent['detail']
) => {
  trace.events.push({
    stage,
    label,
    timestamp: Date.now(),
    detail
  })
}

interface CallAbilityOptions {
  registry: SkillRegistry
  adapters: FacadeAdapters
  user?: FacadeUserContext
  skill: RegisteredSkill
  ability: RegisteredAbility
  input: AtomicAbilityInput
  messages: FacadeMessage[]
}

const callAbility = async ({
  registry,
  adapters,
  user,
  skill,
  ability,
  input,
  messages
}: CallAbilityOptions): Promise<AtomicAbilityResult> => {
  const abilityFn = await ability.load()
  const ctx = createFacadeContext({
    registry,
    adapters,
    user,
    skill,
    ability,
    messages
  })
  const output = await abilityFn(ctx, input)

  if (isAsyncIterable(output)) {
    let lastResult: AtomicAbilityResult | undefined
    for await (const result of output) {
      lastResult = result
      ctx.messages.push(result)
    }

    return (
      lastResult ?? {
        type: 'message',
        status: 'done',
        content: '原子能力已完成。'
      }
    )
  }

  return output
}

interface CreateFacadeContextOptions {
  registry: SkillRegistry
  adapters: FacadeAdapters
  user?: FacadeUserContext
  skill: RegisteredSkill
  ability: RegisteredAbility
  messages: FacadeMessage[]
}

const createFacadeContext = ({
  registry,
  adapters,
  user,
  skill,
  ability,
  messages
}: CreateFacadeContextOptions): FacadeContext => ({
  user: user ?? {
    id: 'mock-user',
    name: 'Mock User'
  },
  agent: {
    id: registry.agent.id,
    name: registry.agent.name
  },
  skill: {
    id: skill.manifest.id,
    name: skill.manifest.name
  },
  ability: {
    id: ability.manifest.id,
    title: ability.manifest.title
  },
  adapters,
  messages: {
    push: (result) => {
      messages.push(
        createMessage({
          role: 'assistant',
          result
        })
      )
    },
    update: (messageId, result) => {
      const message = messages.find((item) => item.id === messageId)
      if (message) {
        message.result = result
      }
    }
  },
  abilities: {
    call: async (abilityId, nestedInput) => {
      const nestedSkill = registry.skills.find((item) =>
        item.abilities.some((candidate) => candidate.manifest.id === abilityId)
      )
      const nestedAbility = nestedSkill?.abilities.find(
        (candidate) => candidate.manifest.id === abilityId
      )

      if (!nestedSkill || !nestedAbility) {
        throw new Error(`Ability not found: ${abilityId}`)
      }

      return callAbility({
        registry,
        adapters,
        user,
        skill: nestedSkill,
        ability: nestedAbility,
        input: nestedInput,
        messages
      })
    }
  }
})

const createTask = (rawText: string): FacadeTask => {
  const now = Date.now()
  return {
    id: createId('task'),
    rawText,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  }
}

interface CreateMessageOptions {
  role: FacadeMessage['role']
  content?: string
  result?: AtomicAbilityResult
}

const createMessage = ({
  role,
  content,
  result
}: CreateMessageOptions): FacadeMessage => ({
  id: createId('msg'),
  role,
  content,
  result,
  createdAt: Date.now()
})

const createId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`

const isAsyncIterable = <T>(value: unknown): value is AsyncIterable<T> =>
  typeof value === 'object' &&
  value !== null &&
  Symbol.asyncIterator in value
