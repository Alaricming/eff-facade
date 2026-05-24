<template>
  <section :class="tokens.shell">
    <div class="flex h-screen overflow-hidden">
      <aside :class="tokens.toolbar" aria-label="Workbench toolbar">
        <button
          v-for="item in toolbarItems"
          :key="item.id"
          type="button"
          :title="item.label"
          :aria-label="item.label"
          :class="[tokens.iconButton, activeDrawer === item.drawer && tokens.iconButtonActive]"
          @click="handleToolbarClick(item)"
        >
          <Icon :icon="item.icon" class="h-[18px] w-[18px]" />
        </button>
      </aside>

      <main :class="tokens.conversation">
        <header class="shrink-0 border-b border-eff-border bg-eff-surface/95 px-7 py-4 backdrop-blur">
          <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.14em] text-eff-subtle">EFF Facade</p>
            <h1 class="mt-1 text-xl font-semibold tracking-normal text-eff-text">
              {{ title }}
            </h1>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-eff-border bg-eff-surface-raised px-3 py-1.5 text-xs text-eff-muted shadow-eff-hairline">
            <span class="h-2 w-2 rounded-full bg-eff-success"></span>
            {{ runtimeStatusText }}
          </div>
          </div>
        </header>

        <section ref="scrollContainer" class="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          <div v-if="messages.length === 0" class="mx-auto flex min-h-[calc(100vh-260px)] max-w-5xl animate-eff-fade-up flex-col justify-center">
            <div class="mb-7">
              <p class="text-sm font-medium text-eff-muted">{{ eyebrow }}</p>
              <h2 class="mt-2 text-3xl font-semibold tracking-normal text-eff-text">
                {{ emptyTitle }}
              </h2>
            </div>
            <div class="grid gap-2">
              <button
                v-for="prompt in examplePrompts"
                :key="prompt"
                type="button"
                class="group flex items-center justify-between rounded-eff-xl border border-eff-border bg-eff-surface px-4 py-3 text-left text-sm text-eff-text shadow-eff-hairline transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-eff-border-strong hover:bg-eff-surface-raised hover:shadow-eff-soft active:translate-y-0"
                @click="usePrompt(prompt)"
              >
                <span>{{ prompt }}</span>
                <Icon :icon="icons.keyboard" class="h-4 w-4 text-eff-subtle transition group-hover:text-eff-text" />
              </button>
            </div>
          </div>

          <TransitionGroup
            v-else
            tag="div"
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
            move-class="transition-transform duration-200 ease-out"
            class="mx-auto w-full max-w-6xl space-y-6"
          >
            <article :key="'top-spacer'" class="h-1"></article>
            <article
              v-for="message in messages"
              :key="message.id"
              class="flex"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="w-full"
                :class="message.role === 'user' ? 'max-w-[860px]' : 'max-w-[980px]'"
              >
                <div
                  class="mb-2 flex items-center gap-2 text-xs font-medium text-eff-muted"
                  :class="message.role === 'user' && 'justify-end'"
                >
                  <template v-if="message.role !== 'user'">
                    <span class="grid h-6 w-6 place-items-center rounded-full border border-eff-border bg-eff-surface shadow-eff-hairline">
                      <Icon :icon="icons.bot" class="h-3.5 w-3.5" />
                    </span>
                    <span>EFF Facade</span>
                  </template>
                  <template v-else>
                    <span>You</span>
                    <span class="grid h-6 w-6 place-items-center rounded-full border border-eff-border bg-eff-surface shadow-eff-hairline">
                      <Icon :icon="icons.user" class="h-3.5 w-3.5" />
                    </span>
                  </template>
                </div>
                <div
                  :class="message.role === 'user' ? userBubbleClass : tokens.bubble"
                >
                  <p v-if="message.content" class="whitespace-pre-wrap text-sm leading-6">
                    {{ message.content }}
                  </p>
                  <EffResultCard
                    v-if="message.result"
                    :result="message.result"
                    :runtime="runtime"
                    :pending="pending"
                    :submitted-result-keys="submittedResultKeys"
                    @form-submit="submitForm"
                    @confirmation-submit="submitConfirmation"
                    @link-open="openLink"
                  />
                </div>
              </div>
            </article>
          </TransitionGroup>
        </section>

        <form
          class="shrink-0 bg-eff-bg px-7 pb-5 pt-2"
          @submit.prevent="submit"
        >
          <div class="mx-auto max-w-6xl rounded-eff-2xl border border-eff-border bg-eff-bg/95 p-2 shadow-eff-hairline backdrop-blur">
            <div class="flex items-end gap-2">
              <textarea
                v-model="draft"
                rows="1"
                class="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-eff-text outline-none placeholder:text-eff-subtle"
                placeholder="输入业务请求，例如：创建一个字典 storage_level..."
                @keydown="handleComposerKeydown"
              />
              <button
                type="submit"
                :disabled="!draft.trim() || pending"
                class="grid h-10 w-10 shrink-0 place-items-center rounded-eff-lg bg-eff-accent text-white shadow-eff-hairline transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-eff-soft active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-eff-hairline"
                aria-label="发送"
              >
                <Icon
                  :icon="pending ? icons.loader : icons.send"
                  class="h-4 w-4"
                  :class="pending && 'animate-spin'"
                />
              </button>
            </div>
            <div class="flex items-center justify-between px-3 pb-1 text-[11px] text-eff-subtle">
              <span>Enter 发送，Shift + Enter 换行</span>
              <span v-if="routeNotice" class="flex items-center gap-1 text-eff-muted">
                <Icon :icon="icons.route" class="h-3 w-3" />
                {{ routeNotice }}
              </span>
            </div>
          </div>
        </form>
      </main>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-4"
      >
        <aside v-if="activeDrawer" :class="tokens.drawer">
          <EffWorkbenchDrawer
            :active-drawer="activeDrawer"
            :tasks="tasks"
            :debug-traces="debugTraces"
            :runtime-info="runtimeInfo"
            @close="activeDrawer = undefined"
          />
        </aside>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  AtomicAbilityInput,
  ConfirmationResult,
  FormResult
} from '@eff-facade/core'
import type { FacadeRuntime } from '@eff-facade/runtime'
import { Icon } from '@iconify/vue'
import { computed, nextTick, ref } from 'vue'
import { EffResultCard } from '@eff-facade/vue-renderer'
import EffWorkbenchDrawer, { type DrawerKind } from './EffWorkbenchDrawer.vue'
import { EFF_FACADE_ICON_NAMES, EFF_FACADE_TONE_CLASSES } from '../tokens'

const props = defineProps<{
  runtime: FacadeRuntime
  initialPrompt?: string
  title?: string
  eyebrow?: string
  emptyTitle?: string
  runtimeStatusText?: string
  examplePrompts?: string[]
}>()

const tokens = EFF_FACADE_TONE_CLASSES
const icons = EFF_FACADE_ICON_NAMES
const activeDrawer = ref<DrawerKind>()
const draft = ref(props.initialPrompt ?? '')
const pending = ref(false)
const renderTick = ref(0)
const routeNotice = ref('')
const scrollContainer = ref<HTMLElement>()
const runningMessage = ref('')
const submittedResultKeys = ref(new Set<string>())

const defaultExamplePrompts = [
  '创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3',
  '创建一个 SKU，编码 SKU-001，名称 蓝牙耳机',
  '我想创建一个知识库',
  '查看用户 u1001 的当前信息'
]

const title = computed(() => props.title ?? 'AI Workbench')
const eyebrow = computed(() => props.eyebrow ?? 'Start with a business request')
const emptyTitle = computed(
  () => props.emptyTitle ?? '让 Facade 帮你运行一个业务 Skill'
)
const runtimeStatusText = computed(
  () => props.runtimeStatusText ?? `${props.runtime.adapters.model.type} model`
)
const examplePrompts = computed(
  () => props.examplePrompts ?? defaultExamplePrompts
)
const runtimeInfo = computed(() => ({
  mode: props.runtimeStatusText ?? 'Embedded',
  modelType: props.runtime.adapters.model.type,
  agentName: props.runtime.registry.agent.name,
  agentId: props.runtime.registry.agent.id,
  skillCount: props.runtime.registry.skills.length,
  abilityCount: props.runtime.registry.skills.reduce(
    (total, skill) => total + skill.abilities.length,
    0
  ),
  componentCount: props.runtime.registry.skills.reduce(
    (total, skill) => total + skill.components.length,
    0
  )
}))

const messages = computed(() => {
  void renderTick.value
  const runtimeMessages = [...props.runtime.messages]
  if (!runningMessage.value) {
    return runtimeMessages
  }

  return [
    ...runtimeMessages,
    {
      id: 'runtime_running',
      role: 'assistant' as const,
      content: runningMessage.value,
      createdAt: Date.now()
    }
  ]
})

const tasks = computed(() => {
  void renderTick.value
  return [...props.runtime.tasks]
})

const debugTraces = computed(() => {
  void renderTick.value
  return [...props.runtime.debugTraces]
})

const toolbarItems: Array<{
  id: string
  label: string
  icon: string
  drawer?: DrawerKind
}> = [
  {
    id: 'new-chat',
    label: '新建会话',
    icon: icons.newChat
  },
  {
    id: 'history',
    label: '任务历史',
    icon: icons.history,
    drawer: 'history'
  },
  {
    id: 'debug',
    label: '调试面板',
    icon: icons.debug,
    drawer: 'debug'
  },
  {
    id: 'settings',
    label: '设置',
    icon: icons.settings,
    drawer: 'settings'
  }
]

const userBubbleClass =
  'rounded-eff-2xl bg-eff-accent px-5 py-3 text-sm leading-6 text-white shadow-eff-hairline transition-all duration-200 ease-out'

const handleToolbarClick = (item: (typeof toolbarItems)[number]) => {
  if (item.id === 'new-chat') {
    props.runtime.clear()
    draft.value = props.initialPrompt ?? ''
    routeNotice.value = ''
    runningMessage.value = ''
    submittedResultKeys.value = new Set()
    activeDrawer.value = undefined
    renderTick.value += 1
    void scrollToTop()
    return
  }

  toggleDrawer(item.drawer)
}

const toggleDrawer = (drawer?: DrawerKind) => {
  if (!drawer) {
    return
  }

  activeDrawer.value = activeDrawer.value === drawer ? undefined : drawer
}

const usePrompt = (prompt: string) => {
  draft.value = prompt
}

const handleComposerKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) {
    return
  }

  event.preventDefault()
  void submit()
}

const submit = async () => {
  const rawText = draft.value.trim()
  if (!rawText || pending.value) {
    return
  }

  pending.value = true
  draft.value = ''
  routeNotice.value = ''
  runningMessage.value = '正在识别意图并执行对应 Skill...'
  renderTick.value += 1
  await scrollToLatest()
  try {
    await props.runtime.run(rawText)
    runningMessage.value = ''
    renderTick.value += 1
    await scrollToLatest()
  } finally {
    runningMessage.value = ''
    pending.value = false
  }
}

const submitForm = async (
  result: FormResult,
  formData: Record<string, unknown>
) => {
  const submitAction = result.submitAction
  if (!submitAction) {
    return
  }

  const input: AtomicAbilityInput = {
    rawText: result.title ?? submitAction.abilityId,
    params: submitAction.params,
    formData,
    source: 'component'
  }

  pending.value = true
  runningMessage.value = '正在提交表单并调用原子能力...'
  renderTick.value += 1
  await scrollToLatest()
  try {
    const runResult = await props.runtime.callAbility(submitAction.abilityId, input)
    if (runResult.message.result?.type !== 'error') {
      submittedResultKeys.value = new Set([
        ...submittedResultKeys.value,
        resultKey(result)
      ])
    }
    runningMessage.value = ''
    renderTick.value += 1
    await scrollToLatest()
  } finally {
    runningMessage.value = ''
    pending.value = false
  }
}

const submitConfirmation = async (result: ConfirmationResult) => {
  const confirmAction = result.confirmAction
  if (!confirmAction) {
    return
  }

  const input: AtomicAbilityInput = {
    rawText: result.title ?? confirmAction.abilityId,
    params: {
      ...confirmAction.params,
      ...result.data
    },
    source: 'component'
  }

  pending.value = true
  runningMessage.value = '正在确认并执行操作...'
  renderTick.value += 1
  await scrollToLatest()
  try {
    await props.runtime.callAbility(confirmAction.abilityId, input)
    runningMessage.value = ''
    renderTick.value += 1
    await scrollToLatest()
  } finally {
    runningMessage.value = ''
    pending.value = false
  }
}

const scrollToTop = async () => {
  await nextTick()
  scrollContainer.value?.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const scrollToLatest = async () => {
  await nextTick()
  const container = scrollContainer.value
  if (!container) {
    return
  }

  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth'
  })
}

const openLink = (href: string) => {
  const resolvedHref = props.runtime.adapters.router.resolve?.(href) ?? href
  props.runtime.adapters.router.open?.(resolvedHref)
  routeNotice.value = `已打开 ${resolvedHref}`
}

const resultKey = (result: FormResult) =>
  result.id ?? `${result.type}:${result.title ?? ''}`
</script>
