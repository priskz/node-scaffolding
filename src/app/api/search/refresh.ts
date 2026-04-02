import { Request, Response } from 'express'
import { z } from 'zod'
import { config } from '~/config'
import { DefaultSearch, log, respond } from '~/lib/util'

/*
 * Param Schema
 */
const paramsSchema = z.object({
	index: z.enum(['default'])
})

async function refreshDefaultSearchIndex(): Promise<boolean> {
	// Retrieve configured index
	const index = config.search.index.default

	// Configured?
	if (!index) {
		// Log error
		log.error('Default search index not configured')

		return false
	}

	// Init search
	const search = new DefaultSearch({ index })

	// Attempt index refresh
	return search.refresh()
}

export async function refresh(req: Request, res: Response): Promise<void> {
	// Validate
	const input = paramsSchema.safeParse(req.params)

	// Invalid?
	if( ! input.success)
	{
		respond(req, res).error()
		return
	}

	// Init
	let refreshed

	// Attempt to refresh the default index
	try {
		// Specific logic per index
		switch (input.data.index) {
			case 'default':
				refreshed = await refreshDefaultSearchIndex()
				break

			default:
				refreshed = false
				break
		}
	} catch (e: unknown) {
		// Log error
		log.error({ error: e instanceof Error ? e.message : String(e) }, 'Search index refresh failed')
	} finally {
		// Refreshed?
		if (refreshed) {
			// Success
			respond(req, res).success()
		} else {
			// Exception
			respond(req, res).exception()
		}
	}
}
