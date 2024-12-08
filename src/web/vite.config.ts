/**
 * Vite configuration file for the web application
 * Requirements addressed:
 * - Frontend Build Configuration (Technical Specification/System Design/Development & Deployment)
 *   Configures the Vite build tool to optimize the frontend application for development and production environments.
 */

/**
 * Human Tasks:
 * 1. Verify that the REACT_APP_API_BASE_URL environment variable is set correctly for production deployment
 * 2. Review build optimization settings for production environment
 * 3. Ensure all required environment variables are documented in the deployment guide
 */

// @ts-check
import { defineConfig } from 'vite'; // v4.0.0
import react from '@vitejs/plugin-react'; // v3.0.0
import { BASE_API_URL } from './src/config/api.config';
import { themeConstants } from './src/constants/theme.constants';

export default defineConfig({
  // Configure plugins
  plugins: [
    react({
      // Enable Fast Refresh for development
      fastRefresh: true,
      // Configure JSX runtime
      jsxRuntime: 'automatic',
      // Configure babel options
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],

  // Base public path
  base: '/',

  // Server configuration
  server: {
    port: 3000,
    // Configure proxy for API requests during development
    proxy: {
      '/api': {
        target: BASE_API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    // Enable source maps for production
    sourcemap: true,
    // Configure rollup options
    rollupOptions: {
      output: {
        // Configure code splitting
        manualChunks: {
          vendor: ['react', 'react-dom'],
          theme: ['@emotion/react', '@emotion/styled']
        }
      }
    },
    // Configure minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // CSS configuration
  css: {
    // Configure preprocessor options
    preprocessorOptions: {
      scss: {
        additionalData: `
          $primary-color: ${themeConstants.primaryColor};
          $secondary-color: ${themeConstants.secondaryColor};
        `
      }
    },
    // Configure PostCSS
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')({
          preset: 'default'
        })
      ]
    }
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@styles': '/src/styles',
      '@utils': '/src/utils'
    }
  },

  // Define global constants
  define: {
    __API_URL__: JSON.stringify(BASE_API_URL),
    __DEV__: process.env.NODE_ENV === 'development'
  },

  // Configure optimizations
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@emotion/react', '@emotion/styled']
  },

  // Configure preview server
  preview: {
    port: 3000,
    open: true
  }
});