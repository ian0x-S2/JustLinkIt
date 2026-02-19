import { browser } from '$app/environment';

const DEFAULT_MOBILE_BREAKPOINT = 1025;

export class IsMobile {
	#matches = $state(false);

	constructor(breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
		if (browser) {
			const query = `(max-width: ${breakpoint - 1}px)`;
			const mediaQueryList = window.matchMedia(query);
			
			// Set initial value
			this.#matches = mediaQueryList.matches;

			// Listen for changes
			mediaQueryList.addEventListener('change', (e) => {
				this.#matches = e.matches;
			});
		}
	}

	get matches() {
		return this.#matches;
	}
}
