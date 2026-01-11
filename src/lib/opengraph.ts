interface OpenGraphData {
	title: string | null;
	description: string | null;
	image: string | null;
}

export async function fetchOpenGraph(url: string): Promise<OpenGraphData> {
	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		});

		if (!response.ok) {
			return { title: null, description: null, image: null };
		}

		const html = await response.text();
		return parseOpenGraph(html, url);
	} catch {
		return { title: null, description: null, image: null };
	}
}

function parseOpenGraph(html: string, baseUrl: string): OpenGraphData {
	const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
	const descriptionMatch = html.match(
		/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
	);
	const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
	const twitterImageMatch = html.match(
		/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i
	);

	let image = imageMatch?.[1] || twitterImageMatch?.[1] || null;
	if (image && !image.startsWith('http')) {
		try {
			image = new URL(image, baseUrl).href;
		} catch {
			image = null;
		}
	}

	const fallbackTitle = html.match(/<title>([^<]+)<\/title>/i)?.[1] || null;

	return {
		title: titleMatch?.[1] || fallbackTitle,
		description: descriptionMatch?.[1] || null,
		image
	};
}
