import { Request, Response } from 'express'
import { Validator } from 'node-input-validator'
import { config } from '~/config'
import { DefaultSearch, log, respond } from '~/lib/util'

async function refreshDefaultSearchIndex(): Promise<boolean> {
	// Retrieve configured index
	const index = config.search.index.default

	// Configured?
	if (!index) {
		// Log error
		log.error('Default search index not properly configured')

		return false
	}

	// Init search
	const search = new DefaultSearch({ index })

	// Attempt index refresh
	return search.refresh()
}

export async function refresh(req: Request, res: Response): Promise<void> {
	// Prepare validation
	const input = new Validator(req.params, {
		index: 'required|in:default'
	})

	// Validate
	if (!(await input.check())) {
		// Erro
		respond(req, res).error()
		return
	}

	// Init
	let refreshed

	// Attempt to refresh the default index
	try {
		// Specific logic per index
		switch (req.params.index) {
			case 'default':
				refreshed = await refreshDefaultSearchIndex()
				break

			default:
				refreshed = false
				break
		}
	} catch (e) {
		// Log error
		log.error(e)
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
