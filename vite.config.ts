import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		devtoolsJson(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: false
			},
			manifest: {
				name: 'LinkIt',
				short_name: 'LinkIt',
				description: 'Local-first link and note manager',
				theme_color: '#09090b',
				background_color: '#09090b',
				display: 'standalone',
				display_override: ['window-controls-overlay', 'standalone'],
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: 'globe-pwa.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'globe-pwa.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'globe-pwa.png',
						sizes: '1000x1000',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
				navigateFallback: '/',
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			}
		})
	],
	build: {
		rollupOptions: {
			external: ['bun:sqlite']
		}
	},
	ssr: {
		external: ['bun:sqlite']
	},
	optimizeDeps: {
		exclude: ['bun:sqlite']
	}
});
