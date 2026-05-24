import vue from '@vitejs/plugin-vue'
import { effFacadePlugin } from '@eff-facade/facade/vite'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), effFacadePlugin({ skillRoot: 'src/skills' })],
  resolve: {
    alias: {
      '@eff-facade/facade': resolve(__dirname, '../../packages/facade/src/index.ts'),
      '@eff-facade/facade/vite': resolve(
        __dirname,
        '../../packages/facade/src/vite.ts'
      ),
      '@eff-facade/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@eff-facade/model-adapter': resolve(
        __dirname,
        '../../packages/model-adapter/src/index.ts'
      ),
      '@eff-facade/runtime': resolve(__dirname, '../../packages/runtime/src/index.ts'),
      '@eff-facade/schema-ui': resolve(
        __dirname,
        '../../packages/schema-ui/src/index.ts'
      ),
      '@eff-facade/skill-loader': resolve(
        __dirname,
        '../../packages/skill-loader/src/index.ts'
      ),
      '@eff-facade/vite-plugin': resolve(
        __dirname,
        '../../packages/vite-plugin/src/index.ts'
      ),
      '@eff-facade/workbench': resolve(
        __dirname,
        '../../packages/workbench/src/index.ts'
      ),
      '@eff-facade/vue-renderer': resolve(
        __dirname,
        '../../packages/vue-renderer/src/index.ts'
      )
    }
  }
})
