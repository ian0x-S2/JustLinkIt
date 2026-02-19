import { SvelteSet } from 'svelte/reactivity';
import type { Link } from '$lib/types';
import { CATEGORIES, type Category } from '$lib/constants';

/**
 * Pure functions for link filtering and tag extraction.
 * Separated for testability and to keep stores focused on state management.
 */
export class FilterService {
	/**
	 * Filters links based on category, search query, and selected tags.
	 */
	static filter(
		links: Link[],
		category: Category,
		searchQuery: string,
		selectedTags: string[]
	): Link[] {
		let result = [...links];

		// Category filtering
		switch (category) {
			case CATEGORIES.INBOX:
				result = result.filter((l) => !l.isDeleted);
				break;
			case CATEGORIES.FAVORITES:
				result = result.filter((l) => l.isFavorite && !l.isDeleted);
				break;
			case CATEGORIES.TRASH:
				result = result.filter((l) => l.isDeleted);
				break;
		}

		// Search query filtering
		const query = searchQuery.trim().toLowerCase();
		if (query) {
			result = result.filter((link) => {
				const titleMatch = link.title?.toLowerCase().includes(query) ?? false;
				const urlMatch = link.url.toLowerCase().includes(query);
				const descMatch = link.description?.toLowerCase().includes(query) ?? false;
				const tagMatch = link.tags.some((tag) => tag.toLowerCase().includes(query));
				return titleMatch || urlMatch || descMatch || tagMatch;
			});
		}

		// Tag filtering
		if (selectedTags.length > 0) {
			result = result.filter((link) => selectedTags.every((tag) => link.tags.includes(tag)));
		}

		return result.sort((a, b) => b.createdAt - a.createdAt);
	}

	/**
	 * Extracts and sorts all unique tags from a list of links.
	 */
	static extractUniqueTags(links: Link[]): string[] {
		const tagSet = new SvelteSet<string>();
		for (const link of links) {
			for (const tag of link.tags) {
				tagSet.add(tag);
			}
		}
		return Array.from(tagSet).sort();
	}
}
