import { Request, Response } from 'express'
import { z } from 'zod'
import { config } from '~/config'
import { ContentSource } from '~/app/domain'
import { ContentSearch } from '~/app/domain'
import {
	log,
	respond,
	SearchBody,
	SearchOptions,
	SearchResult
} from '~/lib/util'

/*
 * Param Schema
 */
const paramsSchema = z.object({
	type: z.enum(['content'])
})

/*
 * Body Schema
 */
const bodySchema = z.object({
	raw: z.any().optional(),
	text: z.string().optional(),
	sort: z.record(z.string(), z.string()).optional(),
	filter: z.record(z.string(), z.unknown()).optional(),
	fields: z.array(z.string()).optional(),
	size: z.number().int().optional(),
	from: z.number().int().optional()
}).refine(
	data => data.raw !== undefined || data.text !== undefined,
	{ message: 'Either raw or text is required' }
)

/*
 * Default Find Query
 */
export function defaultFindQuery(text: string): FindQuery {
	return {
		query: {
			bool: {
				must: {
					multi_match: {
						type: 'best_fields', // default
						query: text,
						fields: ['slug^3', 'title^3', 'subtitle^2', 'body']
					}
				}
			}
		}
	}
}

/*
 * Default Find Options
 */
function defaultFindOptions(): FindOptions {
	return {
		from: 0,
		size: 10
	}
}

/*
 * Build Search Query & Options
 */
function buildSearch(req: Request): { query: FindQuery; options: FindOptions } {
	// Default options
	const options = defaultFindOptions()

	// Search config
	const config = req.body.raw || defaultFindQuery(req.body.text)

	// Filters given?
	if (req.body.filter) {
		// Init
		config.query.bool.filter = []

		// Get filter keys
		const filter = Object.keys(req.body.filter)

		// Itereate filters and add to query
		for (let i = 0; i < filter.length; i++) {
			// Add filter to config.query
			config.query.bool.filter.push({
				term: { [filter[i]]: req.body.filter[filter[i]] }
			})
		}
	}

	// Sorts given?
	if (req.body.sort) {
		// Init
		config.sort = []

		// Get filter keys
		const sort = Object.keys(req.body.sort)

		// Itereate filters and add to query
		for (let i = 0; i < sort.length; i++) {
			// Add sort to query
			config.sort.push({ [sort[i]]: { order: req.body.sort[sort[i]] } })
		}
	}

	// Fields option given?
	if (req.body.fields) options.fields = req.body.fields

	// From option given?
	if (req.body.from) options.from = req.body.from

	// Size option given?
	if (req.body.size) options.size = req.body.size

	// Return result
	return {
		query: config,
		options
	}
}

/*
 * Search Content in ElasticSearch
 */
async function find(
	query: SearchBody,
	options: SearchOptions
): Promise<SearchResult<ContentSource>> {
	// Retrieve default index
	const index = config.search.index.default

	// Configured?
	if (!index) return { count: 0, maxScore: null, data: [] }

	// Init search
	const search = new ContentSearch({ index })

	// Attempt index refresh
	return await search.find(query, options)
}

/*
 * Search for Content
 */
export async function get(req: Request, res: Response): Promise<void> {
	// Validate params
	const params = paramsSchema.safeParse(req.params)

	// Invalid?
	if( ! params.success)
	{
		respond(req, res).error()
		return
	}

	// Validate body
	const body = bodySchema.safeParse(req.body)

	// Invalid?
	if( ! body.success)
	{
		respond(req, res).error()
		return
	}

	// Build search
	const search = buildSearch(req)

	// Attempt search
	try {
		// Find matching content
		const result = await find(search.query, search.options)

		// Found?
		if (result.count > 0) {
			// Success
			respond(req, res).success(result)
		} else {
			// Error
			respond(req, res).error(result, 404)
		}
	} catch (e: unknown) {
		// Log error
		const message = e instanceof Error ? e.message : String(e)
		log.error(message)

		// Error
		respond(req, res).exception(message)
	}
}

interface FindQuery {
	query: {
		bool: {
			must: {
				multi_match: {
					type?: string
					query?: string
					fields?: string[]
				}
			}
			filter?: {}[]
		}
	}
	sort?: {}[]
}

interface FindOptions {
	from?: number
	size?: number
	fields?: string[] | string
}
