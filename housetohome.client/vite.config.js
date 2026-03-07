import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        dedupe: ['react', 'react-dom', 'react-router-dom'],
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5099',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        // Increase the warning limit slightly — our chunks are intentionally split
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React runtime — cached separately, rarely changes
                    'vendor-react': ['react', 'react-dom'],
                    // Router — separate chunk so it can be cached independently
                    'vendor-router': ['react-router-dom'],
                },
            },
        },
    },
})