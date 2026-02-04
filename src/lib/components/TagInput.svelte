<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { X, Plus, Tag as TagIcon, Check, ChevronUp, ChevronDown } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Combobox } from 'bits-ui';

	interface Props {
		selected: string[];
		onchange: (tags: string[]) => void;
	}

	let { selected = [], onchange }: Props = $props();
	const store = getContext<AppStore>('store');

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
		const filtered = store.filters.allTags.filter((t: string) => !selected.includes(t));
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
			!store.filters.allTags.some((t: string) => t.toLowerCase() === value.trim().toLowerCase()) &&
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

<div class="flex flex-wrap items-center gap-1.5">
	<!-- Selected Tags Display -->
	{#each selected as tag (tag)}
		<Badge
			variant="secondary"
			class="h-5 gap-1 rounded-md border-primary/20 bg-primary/10 px-1.5 py-0 text-[10px] font-bold text-primary transition-colors duration-200 animate-in fade-in slide-in-from-left-2 hover:bg-primary/20"
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

	<Popover.Root bind:open>
		<Popover.Trigger
			bind:ref={triggerRef}
			class={cn(
				'flex h-6 items-center gap-1.5 rounded-md border-none bg-transparent px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground',
				open && 'bg-muted/50 text-foreground'
			)}
			role="combobox"
			aria-expanded={open}
		>
			<Plus
				class={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-45')}
			/>
			<span>{selected.length > 0 ? 'Add' : 'Add tags'}</span>
		</Popover.Trigger>

		<Popover.Content
			class="w-56 overflow-hidden rounded-md border border-muted-foreground/10 bg-popover p-0 shadow-xl"
			align="start"
			sideOffset={4}
		>
			<Combobox.Root
				type="single"
				loop={true}
				bind:value={selectedValue}
				inputValue={value}
				items={store.filters.allTags.map((t: any) => ({ value: t, label: t }))}
				bind:open
			>
				<div class="flex items-center border-b border-muted-foreground/5 px-2.5">
					<Combobox.Input
						bind:ref={inputRef}
						placeholder={hasReachedLimit ? 'Limit reached' : 'Search or create tags...'}
						disabled={hasReachedLimit}
						class="h-8 w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50"
						oninput={(e) => (value = e.currentTarget.value)}
						onkeydown={(e) => {
							if (e.key === 'Enter' && showCreateOption) {
								e.preventDefault();
								addTag(value);
							}
						}}
					/>
				</div>
				<Combobox.ContentStatic class="relative flex w-full flex-col bg-popover">
					<Combobox.Viewport
						class="max-h-40 w-full overflow-y-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						{#if showCreateOption}
							<div class="mb-1 border-b border-muted-foreground/5 p-1">
								<button
									class="group flex h-8 w-full items-center justify-between rounded-md border border-muted-foreground/10 bg-muted/40 px-2 text-left text-[12px] transition-all hover:bg-muted/60 active:scale-[0.98]"
									onclick={() => {
										addTag(value);
										value = '';
									}}
								>
									<div class="flex items-center gap-2">
										<Plus class="h-3 w-3 text-primary" />
										<span class="font-medium">Create "{value}"</span>
									</div>
									<div
										class="flex h-4 items-center gap-1 rounded border border-muted-foreground/20 bg-background px-1 text-[9px] font-medium text-muted-foreground/70"
									>
										<span>Enter</span>
									</div>
								</button>
							</div>
						{/if}

						{#if isSearchingSelectedTag}
							<div
								class="flex items-center gap-2 rounded-md bg-muted/20 px-2.5 py-2 text-[11px] text-muted-foreground"
							>
								<Check class="h-3 w-3 text-primary" />
								<span>Already selected</span>
							</div>
						{/if}

						{#each availableTags as tag (tag)}
							<Combobox.Item
								value={tag}
								label={tag}
								class="group flex h-8 cursor-pointer items-center justify-between rounded-md px-2 text-[12px] transition-colors outline-none data-highlighted:bg-muted/50"
							>
								<div class="flex items-center gap-2">
									<TagIcon class="h-3 w-3 opacity-40" />
									<span>{tag}</span>
								</div>
								<div
									class="hidden h-4 items-center gap-1 rounded border border-muted-foreground/20 bg-background px-1 text-[9px] font-medium text-muted-foreground/70 group-data-highlighted:flex"
								>
									<span>Enter</span>
								</div>
							</Combobox.Item>
						{:else}
							{#if !showCreateOption && !isSearchingSelectedTag}
								<div class="py-4 text-center text-[11px] text-muted-foreground/50">
									No results.
								</div>
							{/if}
						{/each}
					</Combobox.Viewport>
				</Combobox.ContentStatic>
			</Combobox.Root>
		</Popover.Content>
	</Popover.Root>
</div>
