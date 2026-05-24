export const EFF_FACADE_PROTOCOL_VERSION = '0.1'

export type RiskLevel = 'low' | 'medium' | 'high'

export type ResultStatus =
  | 'pending'
  | 'running'
  | 'waiting_user_input'
  | 'done'
  | 'error'

export interface AgentManifest {
  schemaVersion: string
  id: string
  name: string
  description?: string
  version?: string
  skills: AgentSkillRef[]
}

export interface AgentSkillRef {
  id: string
  path: string
  enabled?: boolean
}

export interface SkillManifest {
  schemaVersion: string
  id: string
  name: string
  description?: string
  version?: string
  skillDoc: string
  riskLevel?: RiskLevel
  abilities?: AtomicAbilityManifest[]
  components?: AtomicComponentManifest[]
}

export interface AtomicAbilityManifest {
  id: string
  title: string
  description?: string
  entry: string
  exportName?: string
  renderType?: AtomicAbilityRenderType
  requiresConfirmation?: boolean
  riskLevel?: RiskLevel
}

export type AtomicAbilityRenderType =
  | 'message'
  | 'form'
  | 'confirmation'
  | 'description'
  | 'table'
  | 'link-card'
  | 'component'
  | 'mixed'
  | 'error'

export interface AtomicComponentManifest {
  id: string
  title?: string
  entry: string
  componentType: AtomicComponentType
  tagName?: string
}

export type AtomicComponentType = 'vue' | 'react' | 'web-component'

export interface AtomicAbilityInput {
  rawText: string
  params?: Record<string, unknown>
  formData?: Record<string, unknown>
  source: 'model' | 'component' | 'runtime'
  messageId?: string
}

export type AtomicAbility = (
  ctx: FacadeContext,
  input: AtomicAbilityInput
) => Promise<AtomicAbilityResult> | AsyncIterable<AtomicAbilityResult>

export interface FacadeContext {
  user: FacadeUserContext
  agent: FacadeAgentContext
  skill: FacadeSkillContext
  ability?: FacadeAbilityContext
  adapters: FacadeAdapters
  messages: FacadeMessageController
  abilities: FacadeAbilityController
}

export interface FacadeUserContext {
  id: string
  name: string
  roles?: string[]
}

export interface FacadeAgentContext {
  id: string
  name: string
}

export interface FacadeSkillContext {
  id: string
  name: string
}

export interface FacadeAbilityContext {
  id: string
  title: string
}

export interface FacadeAdapters {
  model: ModelAdapter
  http: HttpAdapter
  router: RouterAdapter
  [key: string]: unknown
}

export interface ModelAdapter {
  type: string
  chat?: (input: ModelChatInput) => Promise<ModelChatResult>
  judge?: (input: ModelJudgeInput) => Promise<ModelJudgeResult>
}

export interface ModelChatInput {
  rawText: string
  messages?: FacadeMessage[]
}

export interface ModelChatResult {
  content: string
}

export interface ModelJudgeInput {
  rawText: string
  candidates: SkillCandidate[]
}

export interface ModelJudgeResult {
  skillId?: string
  abilityId?: string
  params?: Record<string, unknown>
  confidence?: number
  fallbackToChat?: boolean
}

export interface SkillCandidate {
  skillId: string
  skillName?: string
  abilityIds?: string[]
  skillDoc?: string
  score?: number
  reason?: string
}

export interface HttpAdapter {
  request?: <T = unknown>(input: HttpRequestInput) => Promise<T>
}

export interface HttpRequestInput {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

export interface RouterAdapter {
  open?: (href: string) => void
  resolve?: (href: string) => string
}

export interface FacadeMessageController {
  push: (result: AtomicAbilityResult) => void
  update: (messageId: string, result: AtomicAbilityResult) => void
}

export interface FacadeAbilityController {
  call: (
    abilityId: string,
    input: AtomicAbilityInput
  ) => Promise<AtomicAbilityResult>
}

export type AtomicAbilityResult =
  | MessageResult
  | FormResult
  | ConfirmationResult
  | DescriptionResult
  | TableResult
  | LinkCardResult
  | ComponentResult
  | MixedResult
  | ErrorResult

export interface BaseResult {
  type: string
  status?: ResultStatus
  id?: string
  title?: string
}

export interface MessageResult extends BaseResult {
  type: 'message'
  content: string
}

export interface FormResult extends BaseResult {
  type: 'form'
  status?: ResultStatus
  jsonSchema: JsonSchema
  uiSchema: UiSchema
  submitAction?: AbilityAction
}

export interface ConfirmationResult extends BaseResult {
  type: 'confirmation'
  status?: ResultStatus
  requiresConfirmation: boolean
  data: Record<string, unknown>
  confirmAction?: AbilityAction
  confirmText?: string
  cancelText?: string
}

export interface DescriptionResult extends BaseResult {
  type: 'description'
  data: Record<string, unknown>
}

export interface TableResult extends BaseResult {
  type: 'table'
  columns: TableColumn[]
  dataSource: Record<string, unknown>[]
}

export interface TableColumn {
  key: string
  title: string
  dataIndex?: string
}

export interface LinkCardResult extends BaseResult {
  type: 'link-card'
  description?: string
  href: string
}

export interface ComponentResult extends BaseResult {
  type: 'component'
  componentId: string
  props?: Record<string, unknown>
}

export interface MixedResult extends BaseResult {
  type: 'mixed'
  blocks: AtomicAbilityResult[]
}

export interface ErrorResult extends BaseResult {
  type: 'error'
  status: 'error'
  message: string
  detail?: string
}

export interface AbilityAction {
  abilityId: string
  params?: Record<string, unknown>
}

export type JsonSchema = Record<string, unknown>

export interface UiSchema {
  fields?: Record<string, UiFieldSchema>
  layout?: unknown
  [key: string]: unknown
}

export type BuiltInUiFieldComponent =
  | 'input'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'switch'
  | 'checkbox'

export interface UiFieldSchema {
  component?: BuiltInUiFieldComponent | (string & {})
  label?: string
  placeholder?: string
  description?: string
  helpText?: string
  order?: number
  hidden?: boolean
  disabled?: boolean
  ['x-reactions']?: unknown[]
  [key: string]: unknown
}

export interface FacadeMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content?: string
  result?: AtomicAbilityResult
  createdAt: number
}

export type FacadeTaskStatus =
  | 'pending'
  | 'running'
  | 'waiting_user_input'
  | 'done'
  | 'error'
  | 'cancelled'

export interface FacadeTask {
  id: string
  rawText: string
  skillId?: string
  abilityId?: string
  status: FacadeTaskStatus
  createdAt: number
  updatedAt: number
  summary?: string
}

export interface RuntimeDebugTrace {
  input: string
  events: RuntimeDebugEvent[]
  candidates: SkillCandidate[]
  selectedSkillId?: string
  selectedAbilityId?: string
  extractedParams?: Record<string, unknown>
  abilityInput?: AtomicAbilityInput
  abilityResult?: AtomicAbilityResult
  renderType?: string
  error?: string
}

export type RuntimeDebugEventStage =
  | 'input'
  | 'recall'
  | 'judge'
  | 'ability'
  | 'render'
  | 'error'

export interface RuntimeDebugEvent {
  stage: RuntimeDebugEventStage
  label: string
  timestamp: number
  detail?: Record<string, unknown>
}

export interface RuntimeRunResult {
  message: FacadeMessage
  task?: FacadeTask
  debug: RuntimeDebugTrace
}

export interface SkillRegistry {
  agent: AgentManifest
  skills: RegisteredSkill[]
}

export interface RegisteredSkill {
  manifest: SkillManifest
  skillDoc: string
  abilities: RegisteredAbility[]
  components: RegisteredComponent[]
}

export interface RegisteredAbility {
  manifest: AtomicAbilityManifest
  load: () => Promise<AtomicAbility>
}

export interface RegisteredComponent {
  manifest: AtomicComponentManifest
  load: () => Promise<unknown>
}
