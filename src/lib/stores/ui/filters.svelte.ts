import type { Link } from '$lib/types';
import { CATEGORIES, type Category, APP_CONFIG } from '$lib/constants';
import { FilterService } from '../infra';

export interface CreateFilterStoreOptions {
	getLinks: () => Link[];
}

export interface FilterStore {
	// Estado
	searchQuery: string;
	readonly isSearchMode: boolean;
	readonly selectedTags: string[];
	readonly activeCategory: Category;
	readonly filteredLinks: Link[];
	readonly allTags: string[];

	// Ações
	setSearchQuery(query: string): void;
	setSearchMode(active: boolean): void;
	toggleTag(tag: string): void;
	clearTags(): void;
	setCategory(category: Category): void;
	reset(): void;
}

export function createFilterStore(options: CreateFilterStoreOptions): FilterStore {
	const { getLinks } = options;

	// Estado privado
	let _searchQuery = $state('');
	let _debouncedSearchQuery = $state('');
	let _isSearchMode = $state(false);
	let _selectedTags = $state<string[]>([]);
	let _activeCategory = $state<Category>(CATEGORIES.INBOX);

	// Debounce effect
	$effect(() => {
		const timeout = setTimeout(() => {
			_debouncedSearchQuery = _searchQuery;
		}, APP_CONFIG.SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	});

	// Estado derivado
	const searchQuery = $derived(_searchQuery);
	const isSearchMode = $derived(_isSearchMode);
	const selectedTags = $derived(_selectedTags);
	const activeCategory = $derived(_activeCategory);

	const filteredLinks = $derived.by(() => {
		return FilterService.filter(getLinks(), _activeCategory, _searchQuery, _selectedTags);
	});

	const allTags = $derived.by(() => {
		return FilterService.extractUniqueTags(getLinks());
	});

	function setSearchQuery(query: string): void {
		_searchQuery = query;
	}

	function setSearchMode(active: boolean): void {
		_isSearchMode = active;
		if (!active) {
			_searchQuery = '';
		}
	}

	function toggleTag(tag: string): void {
		const index = _selectedTags.indexOf(tag);
		if (index !== -1) {
			_selectedTags = _selectedTags.filter((t) => t !== tag);
		} else {
			_selectedTags = [..._selectedTags, tag];
		}
	}

	function clearTags(): void {
		_selectedTags = [];
	}

	function setCategory(category: Category): void {
		_activeCategory = category;
	}

	function reset(): void {
		_searchQuery = '';
		_selectedTags = [];
		_activeCategory = CATEGORIES.INBOX;
	}

	return {
		get searchQuery() {
			return _searchQuery;
		},
		set searchQuery(value: string) {
			_searchQuery = value;
		},
		get isSearchMode() {
			return isSearchMode;
		},
		get selectedTags() {
			return selectedTags;
		},
		get activeCategory() {
			return activeCategory;
		},
		get filteredLinks() {
			return filteredLinks;
		},
		get allTags() {
			return allTags;
		},
		setSearchQuery,
		setSearchMode,
		toggleTag,
		clearTags,
		setCategory,
		reset
	};
}
