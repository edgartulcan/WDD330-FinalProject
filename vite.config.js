import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from "path"

export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    root: "src",
    publicDir: "../public",
    build: {
        outDir: "../dist",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "src/index.html"),
                category: resolve(__dirname, "src/categories/index.html")
            }
        }
    }
})