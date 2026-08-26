import { defineConfig } from 'vite'

// Builds the OPT-IN full-logo bundle (observeops-logos.{js,umd.cjs}) — the complete 445-logo library that populates
// globalThis.__OBS_LOGOS__ for <obs-logo>. Separate from the main elements bundle so it isn't forced on consumers.
export default defineConfig({
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    emptyOutDir: false, // keep the main elements bundle alongside
    lib: {
      entry: 'src/logos-register.js',
      name: 'ObserveOpsLogos',
      formats: ['es', 'umd'],
      fileName: (fmt) => `observeops-logos.${fmt === 'es' ? 'js' : 'umd.cjs'}`,
    },
  },
})
