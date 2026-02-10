<script lang="ts">
	import LazyPanel from './LazyPanel.svelte';
	import LazyBranches from './LazyBranches.svelte';
	import LazyCommits from './LazyCommits.svelte';
	import LazyStash from './LazyStash.svelte';
	import LazyMain from './LazyMain.svelte';
	import LazyStatusBar from './LazyStatusBar.svelte';
	import { theme } from '$lib/tui';

	// Dados de exemplo
	const branches = [
		{
			name: 'dev',
			time: new Date(Date.now() - 23 * 60 * 60 * 1000),
			ahead: 0,
			behind: 1,
			current: true
		},
		{
			name: 'feature/sqlbypass-sessions',
			time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			ahead: 0,
			behind: 0
		},
		{
			name: 'refactor/app-header',
			time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			ahead: 0,
			behind: 0
		},
		{
			name: 'fix/ium-fixes',
			time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
			ahead: 0,
			behind: 1
		},
		{
			name: 'bump/sentry',
			time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
			ahead: 0,
			behind: 1
		},
		{
			name: 'bump/rails-mimemagic',
			time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
			ahead: 0,
			behind: 0
		}
	];

	const commits = [
		{ hash: '0d71772c', message: 'User SqlBypass sessions to avoid', selected: true },
		{ hash: '79832c27', message: 'Invite user modal fixes (#9107)' },
		{ hash: 'b10e81b4', message: 'Updated y18n (#9144)' },
		{ hash: 'f426d3ec', message: 'Allow plugins to add additional' },
		{ hash: 'ffee103d', message: 'update locales from crowdin [ci' },
		{ hash: '809a5b55', message: 'Update locales from crowdin [ci' }
	];

	const stashes = [
		{ id: '1', message: 'WIP on dev: 4ba22a50ea Add Github Actions', selected: true }
	];
</script>

<div class="{theme.app} relative">
	<!-- Left Sidebar -->
	<div class={theme.sidebar}>
		<!-- Status Panel -->
		<LazyPanel title="Status" titleClass={theme.titleStatus} focused={true} class="flex-[0.5]">
			<div class="py-1">
				<span class="text-[#4ec9b0]">↑0↓1</span>
				<span class="ml-2 text-white">dev → dev</span>
			</div>
		</LazyPanel>

		<!-- Files Panel -->
		<LazyPanel title="Files" titleClass={theme.titleFiles} class="flex-[1.5]">
			<svelte:fragment slot="subtitle">
				<span class={theme.titleSubmodules}>Submodules</span>
			</svelte:fragment>
			<div class="text-[#6e7681] italic">No changed files</div>
		</LazyPanel>

		<!-- Local Branches Panel -->
		<LazyPanel
			title="Local Branches"
			titleClass={theme.titleBranches}
			counter="1 of 108"
			class="flex-[1.5]"
		>
			<svelte:fragment slot="subtitle">
				<span class={theme.titleRemotes}>Remotes</span>
				<span class="text-[#6e7681]">{theme.TUI?.separator || '-'}</span>
				<span class={theme.titleTags}>Tags</span>
			</svelte:fragment>
			<LazyBranches {branches} selectedId="dev" />
		</LazyPanel>

		<!-- Commits Panel -->
		<LazyPanel title="Commits" titleClass={theme.titleCommits} counter="1 of 300" class="flex-[2]">
			<svelte:fragment slot="subtitle">
				<span class={theme.titleReflog}>Reflog</span>
			</svelte:fragment>
			<LazyCommits {commits} />
		</LazyPanel>

		<!-- Stash Panel -->
		<LazyPanel title="Stash" titleClass={theme.titleStash} counter="1 of 4" class="flex-[0.5]">
			<LazyStash {stashes} />
		</LazyPanel>
	</div>

	<!-- Main Panel -->
	<LazyMain />

	<!-- Status Bar -->
	<LazyStatusBar />
</div>
