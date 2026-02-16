// LazyGit TUI - Exact match to screenshot

export const TUI = {
	// Box drawing
	h: '─',
	v: '│',
	tl: '┌',
	tr: '┐',
	bl: '└',
	br: '┘',
	lt: '├',
	rt: '┤',

	// Arrows
	arrowUp: '↑',
	arrowDown: '↓',
	arrowRight: '►',
	bullet: '*',
	dot: '•',
	separator: '-',
	check: '✓'
} as const;

// Colors mapped to layout.css variables
export const LG = {
	// Panel title colors
	status: 'var(--destructive)', // Red/pink
	files: 'var(--destructive)',
	branches: 'var(--primary)', // Cyan/blue
	commits: 'var(--primary)',
	stash: 'var(--muted-foreground)',
	reflog: 'var(--chart-3)', // Yellow-ish
	remotes: 'var(--chart-3)',
	tags: 'var(--chart-3)',
	submodules: 'var(--chart-3)',

	// Background
	bg: 'var(--background)',
	bgPanel: 'var(--background)',
	bgSelected: 'var(--accent)',

	// Text
	text: 'var(--foreground)',
	textBright: 'var(--foreground)',
	textMuted: 'var(--muted-foreground)',

	// Status arrows
	arrowUp: 'var(--primary)',
	arrowDown: 'var(--chart-3)',

	// Hash/commit
	hash: 'var(--chart-5)', // Orange-ish
	hashSelected: 'var(--chart-2)', // Light blue-ish

	// Time (relative dates)
	time: 'var(--primary)',

	// Links in main panel
	link: 'var(--primary)',
	linkHighlight: 'var(--secondary)',

	// Border
	border: 'var(--border)',
	borderFocus: 'var(--foreground)'
} as const;

// Theme classes
export const theme = {
	// App
	app: 'h-full w-full bg-background text-foreground font-mono text-[13px] selection:bg-accent selection:text-accent-foreground overflow-hidden flex flex-col',

	// Layout parts
	layoutMain: 'flex flex-1 overflow-hidden gap-4 p-4',
	layoutContent: 'flex flex-col flex-1 min-h-0',

	// Left sidebar with panels
	sidebar: 'w-[300px] shrink-0 flex flex-col gap-4',

	// Panel
	panel: 'relative flex flex-col bg-background min-h-0',
	panelFocus: 'z-10',
	panelHeader:
		'absolute top-0 left-2 -translate-y-1/2 bg-background px-1 flex items-center gap-1 z-20',
	panelBorder: 'absolute inset-0 border border-border pointer-events-none',
	panelBorderFocus: 'border-border border-2',
	panelContent: 'flex flex-col flex-1 min-h-0 overflow-hidden p-2 pt-5',
	panelFooter:
		'absolute bottom-0 right-2 translate-y-1/2 bg-background px-1 text-muted-foreground text-[10px] z-20',

	// Panel titles
	titleStatus: 'text-destructive font-bold uppercase tracking-tight',
	titleFiles: 'text-destructive font-bold uppercase tracking-tight',
	titleBranches: 'text-primary font-bold uppercase tracking-tight',
	titleCommits: 'text-primary font-bold uppercase tracking-tight',
	titleStash: 'text-muted-foreground font-bold uppercase tracking-tight',
	titleReflog: 'text-chart-3 text-[11px]',
	titleRemotes: 'text-chart-3 text-[11px]',
	titleTags: 'text-chart-3 text-[11px]',
	titleSubmodules: 'text-chart-3 text-[11px]',

	// List items
	item: 'py-0.5 cursor-pointer truncate flex items-center gap-2',
	itemDefault: 'hover:bg-muted/50 font-normal',
	itemSelected: 'bg-muted text-primary border border-secondary font-bold',

	itemCurrent: 'text-primary',

	// Branch item
	branchItem: 'flex items-center gap-2 py-0.5',
	branchName: 'truncate',
	branchTime: 'text-primary mr-2',
	branchArrows: 'text-xs',

	// Commit item
	commitHash: 'text-chart-5 mr-2',
	commitHashSelected: 'text-chart-2',
	commitMessage: 'truncate',

	// Main panel (right side)
	main: 'flex-1 overflow-auto',
	mainText: 'text-foreground leading-relaxed',
	mainLink: 'text-primary hover:underline',
	mainLinkHighlight: 'text-secondary',
	mainHeading: 'text-foreground font-bold text-lg mt-4 mb-2',
	mainBullet: 'text-foreground ml-4',

	// Status bar
	statusBar:
		'bg-background border-t border-border px-3 py-1 flex items-center justify-between text-[11px] shrink-0',
	statusItem: 'text-muted-foreground flex items-center gap-4',
	statusKey: 'text-primary',
	statusDonate: 'text-secondary ml-4',
	statusVersion: 'text-primary'
} as const;

// Format arrows for branch status (↑0↓1)
export function formatBranchStatus(ahead: number, behind: number): string {
	const up = ahead > 0 ? `↑${ahead}` : '';
	const down = behind > 0 ? `↓${behind}` : '';
	return `${up}${down}`;
}

// Format relative time (23h, 2d, 3d, 4d)
export function formatRelativeTime(date: Date | string | number): string {
	const d = new Date(date);
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffHours / 24);

	if (diffHours < 24) return `${diffHours}h`;
	return `${diffDays}d`;
}

// Truncate text
export function truncate(str: string, len: number): string {
	if (str.length <= len) return str;
	return str.slice(0, len - 1) + '…';
}
