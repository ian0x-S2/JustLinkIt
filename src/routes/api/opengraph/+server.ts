import { handleOpenGraphRequest } from '$lib/opengraph';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	return handleOpenGraphRequest(request);
};
