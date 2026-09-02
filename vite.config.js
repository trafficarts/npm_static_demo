import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true,
      deleteInlinedFiles: true
    })
  ],
  build: {
    target: 'es2020',
    cssMinify: true,
    minify: true,
    sourcemap: false
  }
});
