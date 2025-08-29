import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
// Optimized for Cloudflare Pages deployment
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  // Get environment variables from either .env file or Cloudflare build environment
  const getEnvVar = (key: string): string => {
    // First try to get from .env file (local development)
    if (env[key]) {
      return env[key]
    }

    // Then try to get from Cloudflare build environment
    if (process.env[key]) {
      return process.env[key] || ''
    }

    // For Cloudflare Pages, some variables might be available at build time
    if (process.env[`VITE_${key.replace('VITE_', '')}`]) {
      return process.env[`VITE_${key.replace('VITE_', '')}`] || ''
    }

    // Return empty string if not found (will be replaced at build time)
    return ''
  }


  return {
    plugins: [react()],
    base: '/',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    // Add define plugin to replace environment variables at build time
    // This ensures variables are embedded in the build for Cloudflare Pages
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(getEnvVar('VITE_SUPABASE_URL')),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(getEnvVar('VITE_SUPABASE_ANON_KEY')),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(getEnvVar('VITE_GOOGLE_CLIENT_ID')),
      'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(getEnvVar('VITE_RAZORPAY_KEY_ID')),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(getEnvVar('VITE_API_BASE_URL')),
    },
    build: {
      target: 'es2020', // Updated for better modern browser support
      outDir: 'dist',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            ui: ['lucide-react'],
          },
          assetFileNames: (assetInfo) => {
            // Handle font files properly
            if (assetInfo.name && /\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 3000,
      open: true,
    },
    preview: {
      port: 4173,
    },
    // Add assetsInclude to ensure font files are handled properly
    assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf', '**/*.eot', '**/*.otf'],
  }
})
