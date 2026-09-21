import { Request, Response } from 'express'
import { z } from 'zod'
import { respond } from '~/lib/util'
import { ContentService } from '~/app/service/data'

/*
 * Param Schema
 */
const paramsSchema = z.object({
	type: z.enum(['content']),
	id: z.string().min(1)
})

/*
 * Update Content's Search Index
 */
async function updateContentSearchIndex(id: string): Promise<boolean> {
	// Init search
	const service = new ContentService()

	// Attempt index refresh
	return service.updateSearchIndex(id)
}

export async function update(req: Request, res: Response): Promise<void> {
	// Validate
	const input = paramsSchema.safeParse(req.params)

	// Invalid?
	if( ! input.success)
	{
		respond(req, res).error()
		return
	}

	// Init
	let updated = false

	// Determine logic based on type
	switch (input.data.type) {
		case 'content':
			// Attempt to update content from source
			updated = await updateContentSearchIndex(input.data.id)
			break
	}

	// Success?
	if (updated) {
		// Success
		respond(req, res).success()
	} else {
		// Error
		respond(req, res).error()
	}
}
