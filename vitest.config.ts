import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
 plugins: [react()],
 test: {
   environment: 'jsdom',
   globals: true,
   coverage: {
     reporter: ['text', 'json', 'html'],
     exclude: ['node_modules/', '.next/'],
     thresholds: {
       lines: 95,
       functions: 95,
       branches: 95,
       statements: 95
     }
   }
 },
 resolve: {
   alias: {
     '@': path.resolve(__dirname, './src')
   }
 }
})
