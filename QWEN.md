# Project Context: Local-First Desktop MVP

- Is a Book Mark web link maganer like a TUI

## You are building an MVP for a local-first desktop application with the following architecture:

- **Framework:** SvelteKit (using Svelte 5 Runes).
- **Runtime & Packaging:** Bun (packaged as a standalone binary).
- **Execution Model:** Operates as a local web server on `localhost`, automatically launching the default system browser upon startup.
- **Data Philosophy:** Local-first, prioritizing offline performance and local data persistence.

---

## You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.

### 2. get-documentation

Retrieves full documentation content for specific sections.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions. MUST be used before finalizing any Svelte code.

### 4. playground-link

Generates a Svelte Playground link. Ask user before use.

---

## Additional Notes

- Your main function is to generate semantic commits when requested.
- Improve prompts when the user requests. Improved prompts will be generated with markdown and stored in a folder called `prompt-improve`.
