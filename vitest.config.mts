import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['src/tests/**/*.ts'],
    exclude: ['src/tests/get_test_db.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/tests/**', 'dist/**', 'styles/**', 'templates/**']
    }
  }
})
