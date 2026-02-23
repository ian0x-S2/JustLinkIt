# LinkIt

A local-first bookmark manager with a keyboard-driven TUI-style interface.

## Features

- **Workspaces** - Organize links into separate workspaces
- **Favorites & Tags** - Mark links as favorites and add custom tags
- **Import/Export** - Import and export your bookmarks as JSON
- **Search & Filters** - Quick search and filter by tags, favorites, or workspace
- **List/Grid View** - Toggle between list and grid display modes
- **OpenGraph Metadata** - Automatically fetches title, description, image, and favicon
- **PWA Support** - Install as a standalone app on your device
- **Keyboard Shortcuts** - Navigate entirely with keyboard

## Tech Stack

- SvelteKit 5 + Svelte 5 Runes
- Bun runtime
- SQLite + Drizzle ORM
- TailwindCSS
- PWA
- [JesterKit](https://jesterkit.com/exe) for binary packaging

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

## Build

```bash
# Build for production
bun run build

# Create binary with JesterKit
bunx @jesterkit/exe-sveltekit
```

## License

MIT
