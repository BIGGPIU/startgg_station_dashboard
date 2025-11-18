/// <reference types="vitest/config" /
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: "https://biggpiu.github.io/startgg_station_dashboard/"
})
