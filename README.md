# LinkIt

A local-first bookmark manager with a TUI-style interface.

## Features

- **Workspaces** - Organize links into separate workspaces
- **Favorites & Tags** - Mark links as favorites and add custom tags
- **Import/Export** - Import and export your bookmarks as JSON
- **Search & Filters** - Quick search and filter by tags, favorites, or workspace
- **List/Grid View** - Toggle between list and grid display modes
- **OpenGraph Metadata** - Automatically fetches title, description, image, and favicon
- **PWA Support** - Install as a standalone app on your device

## Tech Stack

- SvelteKit + Svelte 5 Runes
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
```

## Running as a Local Service (Linux)

To ensure the app starts automatically and remains available as a local PWA, you can set it up as a systemd service.

Create a file at `~/.config/systemd/user/linkit.service` (adjust paths to your project location):

```ini
[Unit]
Description=LinkIt App
After=network.target

[Service]
# Ensure the 'sqlite.db' file is present in the WorkingDirectory
ExecStart=/path/to/your/project/dist/my-app
WorkingDirectory=/path/to/your/project/dist
Restart=always
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
```

**Note:** The application expects the SQLite database (`sqlite.db`) to be located in the same folder defined in `WorkingDirectory`. Ensure it exists or is initialized there before starting the service.

Then run the following commands to enable and start the service:

```bash
systemctl --user daemon-reload
systemctl --user enable linkit
systemctl --user start linkit
```

## License

MIT
