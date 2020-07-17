import { getCustomRepository } from 'typeorm'
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
		super(getCustomRepository(ContentRepository))

		// Set index
		this.index = config.search.index.default

		// Throw if no index configured1
		if (!this.index) throw Error("ContentService's index prop not configured")

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

		// Replace if succesful
		if (!source) return false

		// Update index value
		const replaced = await this.search.replace(source.id, source)

		// Log if not updated
		if (!replaced) {
			console.error('Could not update search index', {
				index: this.index,
				id: source.id
			})
		}

		// Return bool
		return replaced
	}
}
