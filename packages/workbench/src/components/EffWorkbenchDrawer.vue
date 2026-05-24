<template>
  <div class="flex h-full flex-col">
    <header class="flex items-center justify-between border-b border-eff-border px-5 py-4">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.14em] text-eff-subtle">
          {{ drawerTitle }}
        </p>
        <h2 class="mt-1 text-lg font-semibold text-eff-text">{{ drawerHeading }}</h2>
      </div>
      <button
        type="button"
        class="grid h-9 w-9 place-items-center rounded-eff-lg text-eff-muted transition hover:bg-eff-muted-surface hover:text-eff-text"
        @click="$emit('close')"
      >
        <Icon :icon="icons.close" class="h-4 w-4" />
      </button>
    </header>

    <section class="flex-1 overflow-auto p-5">
      <div v-if="activeDrawer === 'history'" class="space-y-3">
        <article
          v-for="task in sortedTasks"
          :key="task.id"
          class="rounded-eff-xl border border-eff-border bg-eff-surface-raised p-4 shadow-eff-hairline transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-eff-border-strong hover:shadow-eff-soft"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-eff-text">{{ task.summary ?? task.rawText }}</p>
              <p class="mt-1 text-xs text-eff-subtle">{{ formatTime(task.updatedAt) }}</p>
            </div>
            <span :class="statusBadgeClass(task.status)">
              <Icon :icon="statusIcon(task.status)" class="h-3 w-3" :class="task.status === 'running' && 'animate-spin'" />
              {{ statusText(task.status) }}
            </span>
          </div>
          <p class="mt-2 line-clamp-2 text-xs leading-5 text-eff-muted">
            {{ task.rawText }}
          </p>
          <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div class="rounded-eff-lg border border-eff-border bg-eff-surface px-2 py-1.5">
              <p class="text-eff-subtle">Skill</p>
              <p class="mt-0.5 truncate text-eff-text">{{ task.skillId ?? '-' }}</p>
            </div>
            <div class="rounded-eff-lg border border-eff-border bg-eff-surface px-2 py-1.5">
              <p class="text-eff-subtle">Ability</p>
              <p class="mt-0.5 truncate text-eff-text">{{ task.abilityId ?? '-' }}</p>
            </div>
          </div>
        </article>
        <p v-if="tasks.length === 0" class="text-sm text-eff-muted">暂无任务历史。</p>
      </div>

      <div v-else-if="activeDrawer === 'debug'" class="space-y-3">
        <article
          v-for="(trace, index) in sortedDebugTraces"
          :key="`${trace.input}-${index}`"
          class="rounded-eff-xl border border-eff-border bg-eff-surface-raised p-4 shadow-eff-hairline"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-eff-text">{{ trace.input }}</p>
              <p class="mt-1 text-xs text-eff-subtle">{{ trace.renderType ?? 'pending' }}</p>
            </div>
            <Icon :icon="icons.code" class="mt-0.5 h-4 w-4 text-eff-muted" />
          </div>

          <div class="mt-3 grid gap-2 text-xs">
            <div class="rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <p class="text-eff-subtle">Selected</p>
              <p class="mt-1 break-words text-eff-text">
                {{ trace.selectedSkillId ?? '-' }} / {{ trace.selectedAbilityId ?? '-' }}
              </p>
            </div>
            <div class="rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <p class="text-eff-subtle">Candidates</p>
              <p class="mt-1 text-eff-text">{{ trace.candidates.length }} matched</p>
            </div>
          </div>

          <ol class="mt-4 space-y-2">
            <li
              v-for="event in trace.events"
              :key="`${event.stage}-${event.timestamp}-${event.label}`"
              class="flex gap-3 rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2"
            >
              <span :class="eventIconClass(event.stage)">
                <Icon :icon="eventIcon(event.stage)" class="h-3.5 w-3.5" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="truncate text-xs font-medium text-eff-text">{{ event.label }}</p>
                  <time class="shrink-0 text-[11px] text-eff-subtle">{{ formatTime(event.timestamp) }}</time>
                </div>
                <p
                  v-if="event.detail"
                  class="mt-1 line-clamp-2 break-words text-[11px] leading-4 text-eff-muted"
                >
                  {{ formatEventDetail(event.detail) }}
                </p>
              </div>
            </li>
          </ol>

          <details class="mt-3 rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
            <summary class="cursor-pointer text-xs font-medium text-eff-muted transition hover:text-eff-text">
              查看原始 Trace
            </summary>
            <pre class="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5 text-eff-muted">{{ JSON.stringify(trace, null, 2) }}</pre>
          </details>
        </article>
        <p v-if="debugTraces.length === 0" class="text-sm text-eff-muted">暂无调试信息。</p>
      </div>

      <div v-else class="space-y-3">
        <section class="rounded-eff-xl border border-eff-border bg-eff-surface-raised p-4 shadow-eff-hairline">
          <div class="flex items-center gap-2 text-sm font-semibold text-eff-text">
            <Icon :icon="icons.server" class="h-4 w-4 text-eff-accent" />
            Runtime
          </div>
          <dl class="mt-3 grid gap-2 text-sm">
            <div class="flex items-center justify-between rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <dt class="text-eff-muted">运行模式</dt>
              <dd class="font-medium text-eff-text">{{ runtimeInfo.mode }}</dd>
            </div>
            <div class="flex items-center justify-between rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <dt class="text-eff-muted">模型来源</dt>
              <dd class="font-medium text-eff-text">{{ runtimeInfo.modelType }}</dd>
            </div>
            <div class="flex items-center justify-between rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <dt class="text-eff-muted">Skill Registry</dt>
              <dd class="font-medium text-eff-text">{{ runtimeInfo.agentName }}</dd>
            </div>
            <div class="flex items-center justify-between rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <dt class="text-eff-muted">Agent ID</dt>
              <dd class="font-medium text-eff-text">{{ runtimeInfo.agentId }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-eff-xl border border-eff-border bg-eff-surface-raised p-4 shadow-eff-hairline">
          <div class="flex items-center gap-2 text-sm font-semibold text-eff-text">
            <Icon :icon="icons.activity" class="h-4 w-4 text-eff-accent" />
            Capabilities
          </div>
          <div class="mt-3 grid gap-2 text-sm text-eff-muted">
            <div class="flex items-center justify-between rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <span>已加载 Skill</span>
              <span class="font-medium text-eff-text">{{ runtimeInfo.skillCount }}</span>
            </div>
            <div class="flex items-center justify-between rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <span>原子能力</span>
              <span class="font-medium text-eff-text">{{ runtimeInfo.abilityCount }}</span>
            </div>
            <div class="flex items-center justify-between rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2">
              <span>原子组件</span>
              <span class="font-medium text-eff-text">{{ runtimeInfo.componentCount }}</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type {
  FacadeTask,
  FacadeTaskStatus,
  RuntimeDebugEventStage,
  RuntimeDebugTrace
} from '@eff-facade/core'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { EFF_FACADE_ICON_NAMES } from '../tokens'

export type DrawerKind = 'history' | 'debug' | 'settings'

export interface WorkbenchRuntimeInfo {
  mode: string
  modelType: string
  agentName: string
  agentId: string
  skillCount: number
  abilityCount: number
  componentCount: number
}

const props = defineProps<{
  activeDrawer: DrawerKind
  tasks: FacadeTask[]
  debugTraces: RuntimeDebugTrace[]
  runtimeInfo: WorkbenchRuntimeInfo
}>()

const icons = EFF_FACADE_ICON_NAMES

defineEmits<{
  close: []
}>()

const drawerTitle = computed(() => {
  if (props.activeDrawer === 'history') return 'Tasks'
  if (props.activeDrawer === 'debug') return 'Runtime'
  return 'Workbench'
})

const drawerHeading = computed(() => {
  if (props.activeDrawer === 'history') return '任务历史'
  if (props.activeDrawer === 'debug') return '调试面板'
  return '设置'
})

const sortedTasks = computed(() =>
  [...props.tasks].sort((a, b) => b.updatedAt - a.updatedAt)
)

const sortedDebugTraces = computed(() => [...props.debugTraces].reverse())

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(timestamp)

const statusText = (status: FacadeTaskStatus) => {
  const textMap: Record<FacadeTaskStatus, string> = {
    pending: '等待',
    running: '运行中',
    waiting_user_input: '待输入',
    done: '完成',
    error: '失败',
    cancelled: '取消'
  }

  return textMap[status]
}

const statusIcon = (status: FacadeTaskStatus) => {
  const iconMap: Record<FacadeTaskStatus, string> = {
    pending: icons.clock,
    running: icons.loader,
    waiting_user_input: icons.play,
    done: icons.success,
    error: icons.error,
    cancelled: icons.circle
  }

  return iconMap[status]
}

const statusBadgeClass = (status: FacadeTaskStatus) => {
  const base =
    'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs'

  if (status === 'done') {
    return `${base} border-emerald-200 bg-emerald-50 text-eff-success`
  }

  if (status === 'error') {
    return `${base} border-red-200 bg-red-50 text-eff-danger`
  }

  if (status === 'running') {
    return `${base} border-teal-200 bg-teal-50 text-eff-info`
  }

  return `${base} border-eff-border bg-eff-surface text-eff-muted`
}

const eventIcon = (stage: RuntimeDebugEventStage) => {
  const iconMap: Record<RuntimeDebugEventStage, string> = {
    input: icons.keyboard,
    recall: icons.search,
    judge: icons.brain,
    ability: icons.wrench,
    render: icons.panel,
    error: icons.error
  }

  return iconMap[stage]
}

const eventIconClass = (stage: RuntimeDebugEventStage) => {
  const base =
    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border'

  if (stage === 'error') {
    return `${base} border-red-200 bg-red-50 text-eff-danger`
  }

  if (stage === 'render') {
    return `${base} border-emerald-200 bg-emerald-50 text-eff-success`
  }

  if (stage === 'ability') {
    return `${base} border-blue-200 bg-blue-50 text-eff-accent`
  }

  return `${base} border-eff-border bg-eff-muted-surface text-eff-muted`
}

const formatEventDetail = (detail: Record<string, unknown>) =>
  Object.entries(detail)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ')
</script>
