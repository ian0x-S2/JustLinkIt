import { setTheme, theme as modeWatcherTheme } from 'mode-watcher';
import { THEMES, STORAGE_KEYS } from '$lib/constants';
import type { ThemeId } from '$lib/types';
import { browser } from '$app/environment';

export interface ThemeStore {
	readonly current: ThemeId;
	setTheme(theme: ThemeId): void;
}

export function createThemeStore(initialValue?: ThemeId): ThemeStore {
	// Sync to cookie for SSR consistency
	$effect(() => {
		if (browser) {
			const current = modeWatcherTheme.current;
			if (current) {
				document.cookie = `${STORAGE_KEYS.THEME}=${current}; path=/; max-age=31536000; SameSite=Lax`;
			}
		}
	});

	return {
		get current() {
			const current = modeWatcherTheme.current as ThemeId;
			if (current) return current;

			// Fallback to initialValue (from SSR)
			if (initialValue) return initialValue;

			// Fallback during hydration/initial render on client
			if (browser) {
				const domTheme = document.documentElement.getAttribute('data-theme');
				if (domTheme && (Object.values(THEMES) as string[]).includes(domTheme)) {
					return domTheme as ThemeId;
				}
			}

			return THEMES.DEFAULT;
		},
		setTheme(newTheme: ThemeId) {
			if (modeWatcherTheme.current !== newTheme) {
				setTheme(newTheme);
			}
		}
	};
}

