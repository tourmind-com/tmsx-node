import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/hotel/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'node18',
  treeshake: true,
});
