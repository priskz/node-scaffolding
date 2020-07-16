import { Request, Response } from 'express'
import { Validator } from 'node-input-validator'
import { respond } from '~/lib/util'
import { ContentService } from '~/app/service/data'

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
	// Prepare validation
	const input = new Validator(req.params, {
		type: 'required|in:content',
		id: 'required'
	})

	// Validate
	if (!(await input.check())) {
		respond(req, res).error()
		return
	}

	// Init
	let updated = false

	// Determine logic based on type
	switch (req.params.type) {
		case 'content':
			// Attempt to update content from source
			updated = await updateContentSearchIndex(req.params.id)
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
