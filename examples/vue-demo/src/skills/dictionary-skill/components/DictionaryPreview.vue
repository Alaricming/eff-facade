<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-eff-text">字典预览</p>
        <p class="mt-1 text-xs text-eff-muted">{{ codeText }}</p>
      </div>
      <span class="rounded-eff-lg bg-eff-accent/10 px-2 py-1 text-xs font-medium text-eff-accent">
        custom component
      </span>
    </div>

    <div class="grid gap-2">
      <div
        v-for="item in normalizedItems"
        :key="`${item.label}-${item.value}`"
        class="flex items-center justify-between rounded-eff-lg bg-eff-surface px-3 py-2 text-sm"
      >
        <span class="text-eff-text">{{ item.label }}</span>
        <span class="text-eff-muted">{{ item.value }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DictionaryItem {
  label: string
  value: string | number
}

const props = defineProps<{
  code?: string
  items?: DictionaryItem[]
}>()

const codeText = computed(() => props.code ?? '未识别字典编码')
const normalizedItems = computed(() => props.items ?? [])
</script>
