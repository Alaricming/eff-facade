<template>
  <section class="rounded-eff-xl border border-eff-border bg-eff-surface-raised p-3 shadow-eff-hairline">
    <component
      :is="component"
      v-if="component"
      v-bind="result.props"
    />

    <div v-else-if="errorMessage" class="space-y-1 text-sm">
      <p class="font-medium text-eff-danger">组件加载失败</p>
      <p class="text-eff-muted">{{ errorMessage }}</p>
    </div>

    <div v-else class="text-sm text-eff-muted">组件加载中...</div>
  </section>
</template>

<script setup lang="ts">
import type { ComponentResult } from '@eff-facade/core'
import type { FacadeRuntime } from '@eff-facade/runtime'
import { markRaw, ref, watchEffect, type Component } from 'vue'

const props = defineProps<{
  result: ComponentResult
  runtime: FacadeRuntime
}>()

const component = ref<Component>()
const errorMessage = ref('')

watchEffect(async () => {
  component.value = undefined
  errorMessage.value = ''

  try {
    const loadedComponent = await props.runtime.loadComponent(
      props.result.componentId
    )
    component.value = markRaw(loadedComponent as Component)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
})
</script>
