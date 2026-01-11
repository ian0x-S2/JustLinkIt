import { json, error } from '@sveltejs/kit';
import { fetchOpenGraph } from '$lib/opengraph';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		try {
			const { url } = await request.json();

			if (!url || typeof url !== 'string') {
				error(400, 'Invalid URL');
			}

			const ogData = await fetchOpenGraph(url);
			return json(ogData);
		} catch (err) {
			error(500, 'Failed to fetch OpenGraph data');
		}
	}
};
