<template>
  <div class="space-y-3">
    <p v-if="result.type === 'message'" class="whitespace-pre-wrap text-sm leading-6">
      {{ result.content }}
    </p>

    <EffSchemaForm
      v-else-if="result.type === 'form'"
      :result="result"
      :disabled="pending"
      :submitted="submittedResultKeys.has(resultKey(result))"
      @submit="(formResult, formData) => emit('formSubmit', formResult, formData)"
    />

    <section
      v-else-if="result.type === 'confirmation'"
      class="space-y-4 rounded-eff-xl border border-eff-border bg-eff-surface-raised p-4 shadow-eff-hairline"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-2">
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-eff-lg border border-eff-border bg-eff-surface shadow-eff-hairline">
            <Icon :icon="confirmationIcon" class="h-4 w-4" :class="confirmationIconClass" />
          </span>
          <div>
            <p class="text-sm font-semibold text-eff-text">{{ result.title ?? '请确认操作' }}</p>
            <p class="mt-1 text-xs leading-5 text-eff-muted">
              {{ confirmationDescription }}
            </p>
          </div>
        </div>
        <span :class="confirmationBadgeClass">
          {{ confirmationStatusText }}
        </span>
      </div>
      <dl class="grid gap-2 text-sm">
        <div
          v-for="[key, value] in Object.entries(result.data)"
          :key="key"
          class="grid grid-cols-[128px_1fr] gap-3 rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2"
        >
          <dt class="text-eff-muted">{{ key }}</dt>
          <dd class="min-w-0 break-words text-eff-text">{{ formatValue(value) }}</dd>
        </div>
      </dl>
      <div v-if="confirmationNote" class="rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2 text-xs leading-5 text-eff-muted">
        {{ confirmationNote }}
      </div>
      <div class="flex justify-end gap-2 border-t border-eff-border pt-3">
        <button
          type="button"
          :disabled="confirmationLocked"
          class="rounded-eff-lg border border-eff-border px-3 py-2 text-sm font-medium text-eff-muted transition hover:bg-eff-muted-surface hover:text-eff-text disabled:cursor-not-allowed disabled:opacity-50"
          @click="cancelConfirmation"
        >
          {{ result.cancelText ?? '取消' }}
        </button>
        <button
          type="button"
          :disabled="confirmationLocked"
          class="inline-flex items-center gap-2 rounded-eff-lg bg-eff-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          @click="confirm"
        >
          <Icon v-if="pending" :icon="icons.loader" class="h-4 w-4 animate-spin" />
          {{ result.confirmText ?? '确认' }}
        </button>
      </div>
    </section>

    <section
      v-else-if="result.type === 'description'"
      class="space-y-2 rounded-eff-xl border border-eff-border bg-eff-surface-raised p-3 shadow-eff-hairline"
    >
      <p v-if="result.title" class="text-sm font-semibold text-eff-text">{{ result.title }}</p>
      <dl class="grid gap-2 text-sm">
        <div
          v-for="[key, value] in Object.entries(result.data)"
          :key="key"
          class="grid grid-cols-[104px_1fr] gap-3 rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2"
        >
          <dt class="text-eff-muted">{{ key }}</dt>
          <dd class="min-w-0 break-words text-eff-text">{{ formatValue(value) }}</dd>
        </div>
      </dl>
    </section>

    <section
      v-else-if="result.type === 'table'"
      class="overflow-hidden rounded-eff-xl border border-eff-border bg-eff-surface shadow-eff-hairline"
    >
      <div class="flex items-center gap-2 border-b border-eff-border px-3 py-2 text-sm font-semibold text-eff-text">
        <Icon :icon="icons.table" class="h-4 w-4 text-eff-accent" />
        <span>{{ result.title ?? '数据表格' }}</span>
      </div>
      <div class="overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-eff-surface-raised text-eff-muted">
            <tr>
              <th
                v-for="column in result.columns"
                :key="column.key"
                class="px-3 py-2 font-medium"
              >
                {{ column.title }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-eff-border">
            <tr v-for="(row, rowIndex) in result.dataSource" :key="rowIndex">
              <td
                v-for="column in result.columns"
                :key="column.key"
                class="px-3 py-2 text-eff-text"
              >
                {{ formatValue(row[column.dataIndex ?? column.key]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <a
      v-else-if="result.type === 'link-card'"
      :href="result.href"
      class="block rounded-eff-xl border border-eff-border bg-eff-surface-raised p-3 shadow-eff-hairline transition hover:border-eff-border-strong hover:bg-eff-surface"
      @click.prevent="emit('linkOpen', result.href)"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="text-sm font-semibold text-eff-text">{{ result.title ?? '打开业务页面' }}</p>
          <p v-if="result.description" class="text-sm leading-6 text-eff-muted">
            {{ result.description }}
          </p>
        </div>
        <Icon :icon="icons.externalLink" class="mt-0.5 h-4 w-4 shrink-0 text-eff-accent" />
      </div>
    </a>

    <EffDynamicComponent
      v-else-if="result.type === 'component'"
      :result="result"
      :runtime="runtime"
    />

    <div v-else-if="result.type === 'mixed'" class="space-y-3">
      <EffResultCard
        v-for="(block, index) in result.blocks"
        :key="block.id ?? index"
        :result="block"
        :runtime="runtime"
        :pending="pending"
        :submitted-result-keys="submittedResultKeys"
        @form-submit="(formResult, formData) => emit('formSubmit', formResult, formData)"
        @confirmation-submit="(confirmationResult) => emit('confirmationSubmit', confirmationResult)"
        @link-open="(href) => emit('linkOpen', href)"
      />
    </div>

    <div v-else-if="result.type === 'error'" class="rounded-eff-xl border border-red-200 bg-red-50 p-3 text-sm text-eff-danger shadow-eff-hairline">
      <div class="flex items-center gap-2 font-medium">
        <Icon :icon="icons.error" class="h-4 w-4" />
        <span>{{ result.message }}</span>
      </div>
      <p v-if="result.detail" class="mt-2 text-xs leading-5">{{ result.detail }}</p>
    </div>

    <div v-else class="rounded-eff-xl border border-eff-border bg-eff-surface-raised p-3 text-sm shadow-eff-hairline">
      <p class="font-medium text-eff-text">{{ unknownResult.title ?? unknownResult.type }}</p>
      <pre class="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-eff-muted">{{ JSON.stringify(unknownResult, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  AtomicAbilityResult,
  ConfirmationResult,
  FormResult
} from '@eff-facade/core'
import type { FacadeRuntime } from '@eff-facade/runtime'
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import EffDynamicComponent from './EffDynamicComponent.vue'
import EffSchemaForm from './EffSchemaForm.vue'

const props = defineProps<{
  result: AtomicAbilityResult
  runtime: FacadeRuntime
  pending?: boolean
  submittedResultKeys?: Set<string>
}>()

const emit = defineEmits<{
  formSubmit: [result: FormResult, formData: Record<string, unknown>]
  confirmationSubmit: [result: ConfirmationResult]
  linkOpen: [href: string]
}>()

const icons = {
  success: 'lucide:check-circle-2',
  error: 'lucide:circle-alert',
  externalLink: 'lucide:external-link',
  shield: 'lucide:shield-check',
  table: 'lucide:table-2',
  close: 'lucide:x',
  loader: 'lucide:loader-circle'
} as const
const cancelled = ref(false)
const unknownResult = props.result as unknown as {
  type?: string
  title?: string
  [key: string]: unknown
}

const pending = computed(() => Boolean(props.pending))
const submittedResultKeys = computed(
  () => props.submittedResultKeys ?? new Set<string>()
)
const confirmationLocked = computed(() => pending.value || cancelled.value)
const confirmationStatusText = computed(() => {
  if (pending.value) return '执行中'
  if (cancelled.value) return '已取消'
  return '待确认'
})
const confirmationBadgeClass = computed(() => {
  const base = 'shrink-0 rounded-full border px-2 py-1 text-xs'
  if (pending.value) {
    return `${base} border-teal-200 bg-teal-50 text-eff-info`
  }
  if (cancelled.value) {
    return `${base} border-eff-border bg-eff-muted-surface text-eff-muted`
  }
  return `${base} border-amber-200 bg-amber-50 text-eff-warning`
})
const confirmationIcon = computed(() => {
  if (pending.value) return icons.loader
  if (cancelled.value) return icons.close
  return icons.shield
})
const confirmationIconClass = computed(() => {
  if (pending.value) return 'animate-spin text-eff-info'
  if (cancelled.value) return 'text-eff-muted'
  return 'text-eff-accent'
})
const confirmationDescription = computed(() => {
  if (cancelled.value) {
    return '这次操作已取消，不会继续调用原子能力。'
  }
  if (pending.value) {
    return '正在调用已注册原子能力，请稍候。'
  }
  return '请确认以下结构化参数，确认后将调用已注册原子能力。'
})
const confirmationNote = computed(() => {
  if (!cancelled.value) {
    return ''
  }

  return '如需重新执行，请重新发起该业务请求。'
})

const confirm = () => {
  if (confirmationLocked.value || props.result.type !== 'confirmation') {
    return
  }

  emit('confirmationSubmit', props.result)
}

const cancelConfirmation = () => {
  if (confirmationLocked.value) {
    return
  }

  cancelled.value = true
}

const resultKey = (result: AtomicAbilityResult) =>
  result.id ?? `${result.type}:${result.title ?? ''}`

const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join('，')
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }

  if (value === undefined || value === null || value === '') {
    return '-'
  }

  return String(value)
}
</script>
