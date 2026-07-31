import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  // Craft/demo: force flags into the client bundle even if .env is missing
  // on a preview host. Set either to "false" in .env to turn off.
  define: {
    'import.meta.env.VITE_AUTH_DISABLED': JSON.stringify(
      process.env.VITE_AUTH_DISABLED ?? 'true',
    ),
    'import.meta.env.VITE_REGISTER_ENABLED': JSON.stringify(
      process.env.VITE_REGISTER_ENABLED ?? 'true',
    ),
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      '@notion-icons': path.resolve(__dirname, './src/assets/notion-icons'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
