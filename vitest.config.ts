import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './vitest.setup.ts',
        include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
        exclude: ['node_modules', '.next', '.git', 'e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/**',
                '.next/**',
                'e2e/**',
                '**/*.config.{ts,js}',
                '**/*.d.ts',
                'app/**',           // UI routes — tested via E2E
                'lib/db/schema/**', // Schema definitions — no logic
                'lib/db/seed*.ts',  // Seed scripts
                'scripts/**',
            ],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
        },
    },
})
