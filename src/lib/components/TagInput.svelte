<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { X, Plus, Tag as TagIcon, Check, ChevronUp, ChevronDown } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { LinkStore } from '$lib/store.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Combobox } from 'bits-ui';

	interface Props {
		selected: string[];
		onchange: (tags: string[]) => void;
	}

	let { selected = [], onchange }: Props = $props();
	const store = getContext<LinkStore>('store');

	let open = $state(false);
	let value = $state(''); // Used for the search input
	let triggerRef = $state<HTMLButtonElement>(null!);
	let inputRef = $state<HTMLInputElement | null>(null);
	let selectedValue = $state<string | undefined>(undefined);

	// Reset search value when popover closes
	$effect(() => {
		if (!open) {
			value = '';
		}
	});

	// Watch for selection changes
	$effect(() => {
		if (selectedValue) {
			// Só adiciona se não estiver já selecionada
			if (!selected.includes(selectedValue)) {
				addTag(selectedValue);
			}
			selectedValue = undefined;
			value = ''; // Limpa a busca após selecionar
		}
	});

	const availableTags = $derived.by(() => {
		const filtered = store.allTags.filter((t: string) => !selected.includes(t));
		if (!value.trim()) return filtered;
		return filtered.filter((t: string) => t.toLowerCase().includes(value.toLowerCase()));
	});

	const hasReachedLimit = $derived(selected.length >= 10);

	// Verifica se a busca atual corresponde a uma tag já selecionada
	const isSearchingSelectedTag = $derived(
		value.trim() !== '' &&
			selected.some((t: string) => t.toLowerCase() === value.trim().toLowerCase())
	);

	const showCreateOption = $derived(
		value.trim() !== '' &&
			!store.allTags.some((t: string) => t.toLowerCase() === value.trim().toLowerCase()) &&
			!selected.some((t: string) => t.toLowerCase() === value.trim().toLowerCase())
	);

	function addTag(tag: string) {
		const trimmed = tag.trim();
		if (!trimmed) return;

		// Validação: não adiciona duplicatas
		if (selected.includes(trimmed)) {
			return;
		}

		// Validação: limita a 10 tags (ajuste conforme necessário)
		if (selected.length >= 10) {
			return;
		}

		onchange([...selected, trimmed]);
		value = '';
	}

	function removeTag(tag: string) {
		onchange(selected.filter((t) => t !== tag));
	}
</script>

<div class="flex w-full flex-col gap-3">
	<!-- Selected Tags Display (Linear Style) -->
	{#if selected.length > 0}
		<div class="flex flex-wrap gap-1.5">
			{#each selected as tag (tag)}
				<Badge
					variant="secondary"
					class="h-6 gap-1 rounded-lg border-primary/20 bg-primary/10 px-1.5 py-0 text-[11px] text-primary transition-colors duration-200 animate-in fade-in slide-in-from-left-2 hover:bg-primary/20"
				>
					{tag}
					<button
						type="button"
						class="ml-0.5 transition-colors outline-none hover:text-destructive"
						onclick={(e) => {
							e.stopPropagation();
							removeTag(tag);
						}}
						aria-label="Remove {tag}"
					>
						<X class="h-2.5 w-2.5" />
					</button>
				</Badge>
			{/each}
		</div>
	{/if}

	<Popover.Root bind:open>
		<Popover.Trigger
			bind:ref={triggerRef}
			class={cn(
				buttonVariants({ variant: 'outline' }),
				'h-10 w-full justify-between border-muted-foreground/10 bg-muted/20 text-[13px] font-normal text-muted-foreground transition-all duration-200 hover:bg-muted/30'
			)}
			role="combobox"
			aria-expanded={open}
		>
			<div class="flex items-center gap-2">
				<TagIcon class="h-3.5 w-3.5 opacity-50" />
				<span>{selected.length > 0 ? 'Add more tags...' : 'Add tags...'}</span>
			</div>
			<Plus
				class={cn('h-3.5 w-3.5 opacity-50 transition-transform duration-200', open && 'rotate-45')}
			/>
		</Popover.Trigger>

		<Popover.Content
			class="w-(--bits-popover-anchor-width) overflow-hidden rounded-md border border-muted-foreground/10 bg-popover p-0 shadow-xl"
			align="start"
			sideOffset={6}
		>
			<Combobox.Root
				type="single"
				bind:value={selectedValue}
				inputValue={value}
				items={store.allTags.map((t: any) => ({ value: t, label: t }))}
				bind:open
			>
				<div class="flex items-center border-b border-muted-foreground/5 px-3">
					<Combobox.Input
						bind:ref={inputRef}
						placeholder={hasReachedLimit ? 'Maximum 10 tags reached' : 'Search or create tags...'}
						disabled={hasReachedLimit}
						class="h-10 w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50"
						oninput={(e) => (value = e.currentTarget.value)}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								if (showCreateOption) {
									addTag(value);
								}
							}
						}}
					/>
				</div>
				<Combobox.ContentStatic class="relative flex w-full flex-col bg-popover">
					<Combobox.ScrollUpButton
						class="absolute top-0 right-0 left-0 z-20 flex w-full items-center justify-center bg-linear-to-b from-popover via-popover/90 to-transparent py-2 text-muted-foreground/60 transition-colors hover:text-primary"
					>
						<ChevronUp class="size-3" />
					</Combobox.ScrollUpButton>

					<Combobox.Viewport
						class="max-h-50 w-full overflow-y-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						{#if showCreateOption}
							<div class="mb-1 border-b border-muted-foreground/5 px-1 pb-1">
								<button
									class="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-primary transition-colors hover:bg-primary/10 hover:text-primary"
									onclick={() => {
										addTag(value);
										value = '';
									}}
								>
									<Plus class="h-3.5 w-3.5" />
									<span>Create "{value}"</span>
								</button>
							</div>
						{/if}

						{#if isSearchingSelectedTag}
							<div
								class="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-3 text-[12px] text-muted-foreground"
							>
								<Check class="h-3.5 w-3.5 text-primary" />
								<span>Tag "{value}" is already selected</span>
							</div>
						{/if}

						{#each availableTags as tag (tag)}
							<Combobox.Item
								value={tag}
								label={tag}
								class="flex cursor-pointer items-center justify-between rounded-lg
								px-2 py-1.5 text-[13px] transition-colors outline-none data-highlighted:bg-muted/50"
							>
								<div class="flex items-center gap-2">
									<TagIcon class="h-3.5 w-3.5 opacity-40" />
									{tag}
								</div>
							</Combobox.Item>
						{:else}
							{#if !showCreateOption && !isSearchingSelectedTag}
								<div class="py-6 text-center text-[12px] text-muted-foreground/60">
									{#if store.allTags.length === 0}
										Create your first tag
									{:else}
										No results found
									{/if}
								</div>
							{/if}
						{/each}
					</Combobox.Viewport>

					<Combobox.ScrollDownButton
						class="absolute right-0 bottom-0 left-0 z-20 flex w-full items-center justify-center bg-linear-to-t from-popover via-popover/90 to-transparent py-2 text-muted-foreground/60 transition-colors hover:text-primary"
					>
						<ChevronDown class="size-3" />
					</Combobox.ScrollDownButton>
				</Combobox.ContentStatic>
			</Combobox.Root>
		</Popover.Content>
	</Popover.Root>
</div>
