// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    prefetch: true,
    image: {
        domains: ['images.unsplash.com']
    },
    vite: {
        plugins: [tailwind()],
        build: {
            assetsInlineLimit: 4096, // Tune inline limit for HDD env
        },
        cacheDir: './node_modules/.vite' // Optimize HDD caching
    }
});
