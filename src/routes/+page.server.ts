import { handleOpenGraphRequest } from '$lib/opengraph';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		return handleOpenGraphRequest(request);
	}
};
