import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist', 
    rollupOptions: {
      input: 'index.html',
       entryFileNames: 'chatbot-widget.js',   
       assetFileNames: 'chatbot-style.css', 
    },
  },
})
