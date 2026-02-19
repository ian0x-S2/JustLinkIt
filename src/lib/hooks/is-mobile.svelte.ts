import { browser } from '$app/environment';

const DEFAULT_MOBILE_BREAKPOINT = 768;

export class IsMobile {
	#matches = $state(false);

	constructor(initial: boolean = false, breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
		this.#matches = initial;
		if (browser) {
			const query = `(max-width: ${breakpoint - 1}px)`;
			const mediaQueryList = window.matchMedia(query);
			
			// Update initial value if in browser
			const currentMatches = mediaQueryList.matches;
			if (this.#matches !== currentMatches) {
				this.#matches = currentMatches;
			}

			// Listen for changes
			mediaQueryList.addEventListener('change', (e) => {
				this.#matches = e.matches;
				// Persist to cookie for server-side detection on next reload
				document.cookie = `isMobile=${e.matches}; path=/; max-age=31536000; SameSite=Lax`;
			});

			// Also set it initially if it differs from what the server thought
			if (document.cookie.indexOf('isMobile=') === -1 || this.#matches !== initial) {
				document.cookie = `isMobile=${this.#matches}; path=/; max-age=31536000; SameSite=Lax`;
			}
		}
	}
	get matches() {
		return this.#matches;
	}
}
