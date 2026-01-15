# Project Context: Local-First Desktop MVP
You are building an MVP for a local-first desktop application with the following architecture:
- **Framework:** SvelteKit (using Svelte 5 Runes).
- **Runtime & Packaging:** Bun (packaged as a standalone binary).
- **Execution Model:** Operates as a local web server on `localhost`, automatically launching the default system browser upon startup.
- **Data Philosophy:** Local-first, prioritizing offline performance and local data persistence.

## UI/UX Design Language (Linear Standard)
Follow a precise, high-productivity aesthetic inspired by Linear:
- **Geometry:** Use moderate border radius (`rounded-md` or `6px`) for main inputs and buttons. Use `4px` or `rounded-[4px]` for smaller elements (badges, sub-buttons). **Strictly avoid `rounded-full` (pill shapes)**.
- **Density:** Maintain a compact layout. Headers should be `h-12`. Use small but crisp typography (11px to 14px).
- **Contrast:** Use subtle borders and background layers (`bg-muted/20`) rather than heavy shadows or high-contrast backgrounds.
- **Precision:** Ensure alignment and consistent padding (usually `px-3` or `px-4`). Use tooltips for icon-only buttons.

## Commit Convention
- After completing a task or a significant change, always suggest a brief, concise, and objective commit message for the user.

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections
Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.

### 2. get-documentation
Retrieves full documentation content for specific sections.

### 3. svelte-autofixer
Analyzes Svelte code and returns issues and suggestions. MUST be used before finalizing any Svelte code.

### 4. playground-link
Generates a Svelte Playground link. Ask user before use.