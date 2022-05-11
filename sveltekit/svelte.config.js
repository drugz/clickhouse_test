import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	experimental: {
		useVitePreprocess: true
	},
	kit: {
		adapter: adapter(),
		vite: {
			server: {
				watch: {
					usePolling: true,
				},
				hmr: {
					port: 24678,
				},
			},
		},
	}

};

export default config;
