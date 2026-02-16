import metascraper from 'metascraper';
import mTitle from 'metascraper-title';
import mDescription from 'metascraper-description';
import mImage from 'metascraper-image';
import mLogo from 'metascraper-logo';
import mClearbit from 'metascraper-clearbit';
import mPublisher from 'metascraper-publisher';
import mAuthor from 'metascraper-author';
import mUrl from 'metascraper-url';
import { json, error } from '@sveltejs/kit';
import { defaultLogger } from '$lib/stores/infra/logger';

const scraper = metascraper([
	mTitle(),
	mDescription(),
	mImage(),
	mLogo(),
	mClearbit(),
	mPublisher(),
	mAuthor(),
	mUrl()
]);

export interface OpenGraphData {
	title: string | null;
	description: string | null;
	image: string | null;
	author?: string | null;
	publisher?: string | null;
	logo?: string | null;
	url?: string | null;
}

export async function fetchOpenGraph(url: string): Promise<OpenGraphData> {
	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.9',
				'Cache-Control': 'no-cache',
				Pragma: 'no-cache'
			}
		});

		if (!response.ok) {
			return { title: null, description: null, image: null, url };
		}

		const html = await response.text();
		const metadata = await scraper({ html, url });

		let logo = metadata.logo || null;

		// Fallback: Google Favicon Service (Highly reliable, handles 404s and provides defaults)
		if (!logo) {
			try {
				const domain = new URL(url).hostname;
				logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
			} catch {
				// Ignore
			}
		}

		return {
			title: metadata.title || null,
			description: metadata.description || null,
			image: metadata.image || null,
			author: metadata.author || null,
			publisher: metadata.publisher || null,
			logo: logo,
			url: metadata.url || url
		};
	} catch (err) {
		defaultLogger.error('Error fetching metadata', { error: err, url });
		return { title: null, description: null, image: null, url };
	}
}

/**
 * Handles a request to fetch OpenGraph data.
 * Consolidates common logic for API routes and Server Actions.
 */
export async function handleOpenGraphRequest(request: Request) {
	try {
		const { url } = await request.json();

		if (!url || typeof url !== 'string') {
			return error(400, 'Invalid URL');
		}

		const ogData = await fetchOpenGraph(url);
		return json(ogData);
	} catch (err) {
		return error(500, `Failed to fetch OpenGraph data: ${err instanceof Error ? err.message : err}`);
	}
}