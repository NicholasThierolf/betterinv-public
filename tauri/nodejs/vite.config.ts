// vite.config.backend.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        // Tells Vite we are building for Node.js, not the browser
        target: 'node22',
        ssr: true,

        lib: {
            entry: path.resolve(__dirname, 'index.ts'),
            name: 'index.js',
        },

        outDir: 'dist-backend',
        emptyOutDir: true,

        rollupOptions: {
            output: {
                format: "es"
            },
            external: [
                "keytar",
            ]
        }
    }
});