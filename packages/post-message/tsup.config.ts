import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    splitting: false,
    sourcemap: true,
    clean: true,
    format: ['esm', 'cjs', 'iife'],
    globalName: 'PM',
    dts: true,
    outDir: 'build',
    minify: !options.watch,
  };
});
