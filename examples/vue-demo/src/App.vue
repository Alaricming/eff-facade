<template>
  <EffFacadeWorkbench
    :runtime="runtime"
    :initial-prompt="initialPrompt"
    runtime-status-text="Mock runtime"
  />
</template>

<script setup lang="ts">
import {
  createMockModelAdapter,
  createRuntime,
  EffFacadeWorkbench,
  type FacadeAdapters
} from '@eff-facade/facade'
import { shallowRef } from 'vue'
import skillRegistry from 'virtual:eff-facade/skills'

const DEFAULT_PROMPT = '创建一个字典 storage_level，枚举值为：充足 1，紧张 2，空 3'
const MOCK_SERVER_BASE_URL = 'http://127.0.0.1:4300'

const initialPrompt =
  new URLSearchParams(window.location.search).get('prompt') ?? DEFAULT_PROMPT

const adapters: FacadeAdapters = {
  model: createMockModelAdapter(),
  http: {
    request: async (input) => {
      const response = await fetch(`${MOCK_SERVER_BASE_URL}${input.url}`, {
        method: input.method ?? 'GET',
        headers: {
          'content-type': 'application/json',
          ...input.headers
        },
        body: input.body === undefined ? undefined : JSON.stringify(input.body)
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => undefined)
        const message =
          errorPayload?.error?.message ??
          errorPayload?.message ??
          `HTTP ${response.status}: ${input.url}`

        throw new Error(message)
      }

      return response.json()
    }
  },
  router: {
    resolve: (href) => href,
    open: (href) => {
      window.history.pushState({}, '', href)
    }
  }
}

const runtime = shallowRef(
  createRuntime({
    registry: skillRegistry,
    adapters
  })
)
</script>
