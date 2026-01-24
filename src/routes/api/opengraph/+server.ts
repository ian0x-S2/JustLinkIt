import { json, error } from '@sveltejs/kit';
import { fetchOpenGraph } from '$lib/opengraph';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();

		if (!url || typeof url !== 'string') {
			return error(400, 'Invalid URL');
		}

		const ogData = await fetchOpenGraph(url);
		return json(ogData);
	} catch (err) {
		return error(500, `Failed to fetch OpenGraph data ${err}`);
	}
};
