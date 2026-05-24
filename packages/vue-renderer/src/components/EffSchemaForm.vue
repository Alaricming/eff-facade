<template>
  <form class="space-y-4" @submit.prevent="submit">
    <header v-if="model.title" class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-eff-text">{{ model.title }}</h3>
        <p v-if="result.status" class="text-xs text-eff-subtle">{{ result.status }}</p>
      </div>
      <span
        v-if="submitted"
        class="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-eff-success"
      >
        已提交
      </span>
    </header>

    <p
      v-if="submitted"
      class="rounded-eff-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-eff-success"
    >
      表单已提交并锁定。如需再次提交，请重新发起业务请求。
    </p>

    <div
      v-for="field in visibleFields"
      :key="field.key"
      class="space-y-2"
    >
      <label
        :for="fieldId(field.key)"
        class="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.08em] text-eff-muted"
      >
        <span>{{ field.label }}</span>
        <span v-if="field.required" class="text-eff-danger">*</span>
      </label>

      <textarea
        v-if="field.component === components.textarea"
        :id="fieldId(field.key)"
        :value="String(formValues[field.key])"
        @input="updateTextValue(field.key, $event)"
        :disabled="isDisabled(field.disabled)"
        :placeholder="field.placeholder"
        :class="controlClass(field.key, 'min-h-24 resize-y py-2')"
      />

      <select
        v-else-if="field.component === components.select"
        :id="fieldId(field.key)"
        v-model="formValues[field.key]"
        :disabled="isDisabled(field.disabled)"
        :class="controlClass(field.key)"
      >
        <option value="">请选择</option>
        <option
          v-for="option in field.options"
          :key="String(option.value)"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <div
        v-else-if="field.component === components.radio"
        class="flex flex-wrap gap-2"
      >
        <label
          v-for="option in field.options"
          :key="String(option.value)"
          class="flex items-center gap-2 rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2 text-sm text-eff-text transition hover:border-eff-border-strong"
        >
          <input
            v-model="formValues[field.key]"
            type="radio"
            :value="option.value"
            :disabled="isDisabled(field.disabled)"
            class="accent-eff-accent"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>

      <label
        v-else-if="field.component === components.switch"
        class="inline-flex items-center gap-2 rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2 text-sm text-eff-text transition hover:border-eff-border-strong"
      >
        <input
          v-model="formValues[field.key]"
          type="checkbox"
          :disabled="isDisabled(field.disabled)"
          class="accent-eff-accent"
        />
        <span>{{ formValues[field.key] ? '开启' : '关闭' }}</span>
      </label>

      <label
        v-else-if="field.component === components.checkbox"
        class="inline-flex items-center gap-2 rounded-eff-lg border border-eff-border bg-eff-surface px-3 py-2 text-sm text-eff-text transition hover:border-eff-border-strong"
      >
        <input
          v-model="formValues[field.key]"
          type="checkbox"
          :disabled="isDisabled(field.disabled)"
          class="accent-eff-accent"
        />
        <span>{{ field.description ?? field.label }}</span>
      </label>

      <input
        v-else
        :id="fieldId(field.key)"
        v-model="formValues[field.key]"
        :type="inputType(field.component)"
        :disabled="isDisabled(field.disabled)"
        :placeholder="field.placeholder"
        :class="controlClass(field.key)"
      />

      <p v-if="field.description" class="text-xs leading-5 text-eff-muted">
        {{ field.description }}
      </p>
      <p v-if="field.helpText" class="text-xs leading-5 text-eff-subtle">
        {{ field.helpText }}
      </p>
      <p v-if="fieldErrors[field.key]" class="text-xs leading-5 text-eff-danger">
        {{ fieldErrors[field.key] }}
      </p>
    </div>

    <p v-if="errorMessage" class="rounded-eff-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-eff-danger">
      {{ errorMessage }}
    </p>

    <div class="flex justify-end gap-2 pt-1">
      <button
        type="button"
        :disabled="isDisabled()"
        class="rounded-eff-lg border border-eff-border px-3 py-2 text-sm font-medium text-eff-muted transition hover:bg-eff-muted-surface hover:text-eff-text disabled:cursor-not-allowed disabled:opacity-50"
        @click="reset"
      >
        重置
      </button>
      <button
        type="submit"
        :disabled="isDisabled()"
        class="rounded-eff-lg bg-eff-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ submitting ? '提交中' : '提交' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { AtomicAbilityResult, FormResult } from '@eff-facade/core'
import {
  EFF_SCHEMA_UI_COMPONENTS,
  createFormModel,
  type SchemaUiValue
} from '@eff-facade/schema-ui'
import { computed, reactive, ref } from 'vue'

const props = defineProps<{
  result: FormResult
  disabled?: boolean
  submitted?: boolean
}>()

const emit = defineEmits<{
  submit: [result: FormResult, formData: Record<string, unknown>]
  done: [result: AtomicAbilityResult]
}>()

const components = EFF_SCHEMA_UI_COMPONENTS
const model = computed(() => createFormModel(props.result))
const formValues = reactive<Record<string, SchemaUiValue>>({})
const fieldErrors = reactive<Record<string, string>>({})
const errorMessage = ref('')
const submitting = ref(false)

const visibleFields = computed(() =>
  model.value.fields.filter((field) => !field.hidden)
)

const hydrateValues = () => {
  Object.keys(formValues).forEach((key) => {
    delete formValues[key]
  })
  Object.assign(formValues, model.value.initialValues)
}

hydrateValues()

const reset = () => {
  errorMessage.value = ''
  clearFieldErrors()
  hydrateValues()
}

const submit = async () => {
  clearFieldErrors()
  const missingField = visibleFields.value.find(
    (field) => field.required && isEmptyValue(formValues[field.key])
  )
  if (missingField) {
    fieldErrors[missingField.key] = `请填写${missingField.label}`
    errorMessage.value = '请完善必填字段后再提交。'
    return
  }

  errorMessage.value = ''
  submitting.value = true
  try {
    emit('submit', props.result, { ...formValues })
  } finally {
    submitting.value = false
  }
}

const isEmptyValue = (value: unknown) =>
  value === undefined || value === null || value === ''

const updateTextValue = (key: string, event: Event) => {
  formValues[key] = (event.target as HTMLTextAreaElement).value
}

const isDisabled = (fieldDisabled = false) =>
  fieldDisabled ||
  submitting.value ||
  Boolean(props.disabled) ||
  Boolean(props.submitted)

const clearFieldErrors = () => {
  Object.keys(fieldErrors).forEach((key) => {
    delete fieldErrors[key]
  })
}

const fieldId = (key: string) => `eff-schema-field-${key}`

const inputType = (component: string) => {
  if (component === components.number) {
    return 'number'
  }

  if (component === components.date) {
    return 'date'
  }

  return 'text'
}

const controlClass = (key: string, extra = '') => [
  'w-full rounded-eff-lg border bg-eff-surface px-3 text-sm text-eff-text outline-none transition placeholder:text-eff-subtle focus:border-eff-border-strong disabled:cursor-not-allowed disabled:opacity-60',
  extra || 'h-10',
  fieldErrors[key] ? 'border-eff-danger' : 'border-eff-border'
]
</script>
