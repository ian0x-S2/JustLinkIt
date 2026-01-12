<script lang="ts">
import type { Link } from "$lib/types";
import { addLink, updateLink } from "$lib/store.svelte";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "$lib/components/ui/dialog";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Button } from "$lib/components/ui/button";
import { Textarea } from "$lib/components/ui/textarea";
import { Save, X } from "@lucide/svelte";
import { browser } from "$app/environment";

interface Props {
  link?: Link;
  open?: boolean;
  onclose: () => void;
}

let { link, open = $bindable(), onclose }: Props = $props();

let url = $state("");
let title = $state("");
let description = $state("");
let tags = $state("");
let image = $state("");
let author = $state("");
let publisher = $state("");
let logo = $state("");
let isSaving = $state(false);
let isLoadingPreview = $state(false);

$effect(() => {
  if (link) {
    open = true;
    url = link.url || "";
    title = link.title || "";
    description = link.description || "";
    tags = link.tags.join(", ") || "";
    image = link.image || "";
    author = link.author || "";
    publisher = link.publisher || "";
    logo = link.logo || "";
  } else if (open) {
    url = "";
    title = "";
    description = "";
    tags = "";
    image = "";
    author = "";
    publisher = "";
    logo = "";
  }
});

function closeDialog() {
  open = false;
  onclose();
}

async function fetchOpenGraphPreview() {
  if (!browser || !url) return;

  isLoadingPreview = true;
  try {
    const response = await fetch("/api/opengraph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.title && !title) title = data.title;
      if (data.description && !description) description = data.description;
      if (data.image && !image) image = data.image;
      if (data.author && !author) author = data.author;
      if (data.publisher && !publisher) publisher = data.publisher;
      if (data.logo && !logo) logo = data.logo;
    }
  } catch {
    // Ignore errors, user can manually enter data
  } finally {
    isLoadingPreview = false;
  }
}

async function handleSubmit() {
  if (!url.trim()) return;

  isSaving = true;
  try {
    const tagList = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const linkData = {
      url: url.trim(),
      title: title.trim() || null,
      description: description.trim() || null,
      image: image.trim() || null,
      author: author.trim() || null,
      publisher: publisher.trim() || null,
      logo: logo.trim() || null,
      tags: tagList,
    };

    if (link?.id) {
      updateLink(link.id, linkData);
    } else {
      addLink(linkData);
    }

    closeDialog();
  } finally {
    isSaving = false;
  }
}
</script>

<Dialog bind:open>
	<DialogContent class="max-w-4xl min-w-[40vw] ">
		<DialogHeader>
			<DialogTitle>{link ? 'Edit Link' : 'Add New Link'}</DialogTitle>
		</DialogHeader>
		<div class="space-y-4">
		<div class="space-y-2">
			<Label for="url">URL</Label>
			<div class="flex gap-2">
				<Input id="url" bind:value={url} placeholder="https://example.com" class="flex-1" />
				<Button
					variant="outline"
					onclick={fetchOpenGraphPreview}
					disabled={!url || isLoadingPreview}
				>
					{isLoadingPreview ? 'Loading...' : 'Fetch Preview'}
				</Button>
			</div>
		</div>

		<div class="space-y-2">
			<Label for="title">Title (optional)</Label>
			<Input id="title" bind:value={title} placeholder="Link title" />
		</div>

		<div class="space-y-2">
			<Label for="description">Description (optional)</Label>
			<Textarea
				id="description"
				bind:value={description}
				placeholder="Brief description of the link"
				rows={2}
			/>
		</div>

		<div class="space-y-2">
			<Label for="tags">Tags (comma-separated)</Label>
			<Input id="tags" bind:value={tags} placeholder="tag1, tag2, tag3" />
		</div>

		{#if image}
			<div class="space-y-2">
				<Label>Preview Image</Label>
				<img src={image} alt="Preview" class="h-32 w-full rounded-lg object-cover" />
			</div>
		{/if}
		</div>
		<DialogFooter class="flex justify-end gap-2">
			<Button variant="outline" onclick={closeDialog}>Cancel</Button>
			<Button onclick={handleSubmit} disabled={isSaving || !url.trim()}>
				{isSaving ? 'Saving...' : 'Save'}
				{#if !isSaving}
					<Save class="ml-2 h-4 w-4" />
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
