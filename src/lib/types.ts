export interface Workspace {
	id: string;
	name: string;
	slug: string;
	icon?: string;
	createdAt: number;
}

export interface Link {
	id: string;
	url: string;
	title: string | null;
	description: string | null;
	image: string | null;
	author?: string | null;
	publisher?: string | null;
	logo?: string | null;
	createdAt: number;
	updatedAt: number;
	tags: string[];
	aiSummary?: string;
	workspaceId: string;
}

export interface AIConfig {
	enabled: boolean;
	baseUrl: string;
	apiKey: string;
	model: string;
}

export interface AISuggestion {
	type: 'summary' | 'tags' | 'insight';
	linkId: string;
	content: string | string[];
	estimatedCost: number;
	pending: boolean;
}
