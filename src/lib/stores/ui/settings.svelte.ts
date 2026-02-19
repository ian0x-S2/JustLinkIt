import { PersistedState } from 'runed';
import { STORAGE_KEYS } from '$lib/constants';

export interface SettingsStore {
	readonly viewMode: 'list' | 'grid';
	setViewMode(mode: 'list' | 'grid'): void;
}

export function createSettingsStore(initialValue: 'list' | 'grid' = 'list'): SettingsStore {
	const mode = new PersistedState<'list' | 'grid'>(STORAGE_KEYS.VIEW_MODE, initialValue);

	// Optional: Keep cookie sync for SSR if needed, but the main state is now managed by PersistedState
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.cookie = `${STORAGE_KEYS.VIEW_MODE}=${mode.current}; path=/; max-age=31536000; SameSite=Lax`;
		}
	});

	return {
		get viewMode() {
			return mode.current;
		},
		setViewMode(newMode: 'list' | 'grid') {
			mode.current = newMode;
		}
	};
}
