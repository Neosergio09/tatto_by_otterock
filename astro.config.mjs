// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel({}),
    prefetch: true,
    image: {
        domains: ['images.unsplash.com']
    },
    security: {
        checkOrigin: false
    },
    vite: {
        plugins: [tailwind()],
        build: {
            assetsInlineLimit: 4096, // Tune inline limit for HDD env
        },
        cacheDir: './node_modules/.vite' // Optimize HDD caching
    }
});
