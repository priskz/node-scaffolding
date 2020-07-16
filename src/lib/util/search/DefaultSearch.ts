import { Client as ElasticSearchClient } from '@elastic/elasticsearch'
import { SearchClient } from './'
import { SearchBody, SearchResult, SearchOptions } from './'

export class DefaultSearch<T = any> {
	/**
	 * Search Client
	 */
	protected _client: SearchClient

	/**
	 * Index to act on
	 */
	protected index = 'default-index'

	/**
	 * Construct
	 */
	constructor(options: DefaultSearchOptions = {}) {
		// Set index
		if (options.index) this.index = options.index

		// Set _client
		if (options.client) {
			this._client = options.client
		} else {
			// Default
			this._client = new SearchClient(this.index)
		}
	}

	/**
	 * Refresh index
	 */
	public async refresh(): Promise<boolean> {
		// Refresh
		return await this._client.refresh()
	}

	/**
	 * Find data
	 */
	public async find(
		body: SearchBody,
		options?: SearchOptions
	): Promise<SearchResult<T>> {
		// Search
		return await this._client.search<T>(body, options)
	}

	/**
	 * Update index data value
	 */
	public async update(id: string | number, data: {}): Promise<boolean> {
		return await this._client.update(id.toString(), data)
	}

	/**
	 * Get _client property
	 */
	public getClient(): SearchClient {
		// Search
		return this._client
	}
	/**
	 * Get client's source property
	 */
	public getSource(): ElasticSearchClient {
		// Search
		return this._client.getSource()
	}
}

interface DefaultSearchOptions {
	client?: SearchClient
	index?: string
}
