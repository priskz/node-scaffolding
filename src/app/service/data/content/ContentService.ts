import { DataService } from '~/lib/service/DataService'
import { Content, ContentRepository, ContentSearch } from '~/app/domain'
import { config } from '~/config'

export class ContentService extends DataService<Content> {
	/*
	 * Search Index Name
	 */
	protected index: string

	/*
	 * Content Search
	 */
	protected search: ContentSearch

	/*
	 * Construct
	 */
	constructor() {
		// Set repository prop via parent
		super(new ContentRepository())

		// Set index
		this.index = config.search.index.default

		// No index?
		if( ! this.index) throw Error("ContentService's index prop not configured")

		// Init Search
		this.search = new ContentSearch({ index: this.index })
	}

	/*
	 * Get a Content by id
	 */
	public async getOneById(id: string): Promise<Content | undefined> {
		return await this.getOne({ where: { id } })
	}

	/*
	 * Update a Content's search index
	 */
	public async updateSearchIndex(id: string): Promise<boolean> {
		// Get source
		const source = await this.getOneById(id)

		// Not found?
		if( ! source) return false

		// Update index
		const replaced = await this.search.replace(source.id, source)

		// Failed?
		if( ! replaced) {
			console.error('Could not update search index', {
				index: this.index,
				id: source.id
			})
		}

		// Return
		return replaced
	}
}
