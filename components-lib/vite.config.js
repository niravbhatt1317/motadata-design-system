import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Build the leaf components as framework-agnostic custom elements.
// customElement:true → plugin-vue inlines each SFC's <style> into its shadow root.
export default defineConfig({
  // Lib mode doesn't replace these for us → the browser bundle would hit "process is not defined".
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  plugins: [vue({ customElement: true })],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'ObserveOpsElements',
      formats: ['es', 'umd'],
      fileName: (fmt) => `observeops-elements.${fmt === 'es' ? 'js' : 'umd.cjs'}`,
    },
  },
})
