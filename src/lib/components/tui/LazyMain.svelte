<script lang="ts">
	import { theme, LG } from '$lib/tui';
</script>

<div class={theme.main}>
	<pre class="mb-4 text-xs leading-none text-[#4ec9b0]">
   _                       _ _
  | |                     | (_)
  | | __ _ _____   _  __ _| |_ _ __ ___   __ _
  | |/ _` |_  / | | |/ _` | | | '_ ` _ \ / _` |
  | | (_| |/ /| |_| | (_| | | | | | | | | (_| |
  |_|\__,_/___|\__, |\__, |_|_|_| |_| |_|\__, |
                __/ | __/ |             __/ |
               |___/ |___/             |___/
	</pre>

	<p class="mb-4">Copyright (c) 2018 Jesse Duffield</p>

	<p class="mb-2">
		Keybindings: <span class={theme.mainLink}
			>https://github.com/jesseduffield/lazygit/blob/master/docs/keybindings</span
		>
	</p>

	<p class="mb-2">
		Config Options: <span class={theme.mainLink}
			>https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md</span
		>
	</p>

	<p class="mb-4">
		Tutorial: <span class={theme.mainLink}>https://youtu.be/VDXvbHZYeKY</span>
	</p>

	<p class="mb-2">
		Raise an Issue: <span class={theme.mainLink}
			>https://github.com/jesseduffield/lazygit/issues</span
		>
	</p>

	<p class="mb-4">
		<span class={theme.mainLinkHighlight}
			>Become a sponsor (github is matching all donations for 12 months):</span
		> <span class={theme.mainLink}>https://github.com/sponsors/jesseduffield</span>
	</p>

	<h2 class={theme.mainHeading}>## lazygit 0.24 Release Notes</h2>

	<p class={theme.mainBullet}>- Suggestions now shown when checking out branch by name</p>
	<p class={theme.mainBullet}>- Minimum OSX version is now officially 10.10</p>
</div>
