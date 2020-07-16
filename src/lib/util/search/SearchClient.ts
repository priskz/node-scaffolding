import { Client as ElasticSearchClient } from '@elastic/elasticsearch'
import { log } from '~/lib/util'
import {
	Hit,
	SearchBody,
	SearchOptions,
	SearchResult,
	SearchResponse,
	SourceOptions
} from './'

/**
 * Default Client Options
 * @note: These are ES's default values
 */
const defaultClientOptions: SourceOptions = {
	node: 'http://localhost:9200',
	maxRetries: 3,
	requestTimeout: 3000,
	pingTimeout: 3000,
	sniffInterval: false,
	sniffOnStart: false,
	sniffEndpoint: '_nodes/_all/http',
	sniffOnConnectionFault: false,
	resurrectStrategy: 'ping',
	suggestCompression: false,
	compression: undefined,
	name: 'elasticsearch-js',
	opaqueIdPrefix: undefined,
	headers: {}
}

/**
 * Default Search Query Options
 * Note: These are ES's default values
 */
const defaultSearchOptions: SearchOptions = {
	from: 0,
	size: 10,
	sort: [],
	fields: ['*']
}

export class SearchClient {
	/**
	 * Internal Source
	 */
	private _source: ElasticSearchClient

	/**
	 * Index to act on
	 */
	protected index: string

	/**
	 * Construct
	 */
	constructor(index: string, options: SourceOptions = {}) {
		// Set index
		this.index = index

		// Override default options
		const config: SourceOptions = {
			...defaultClientOptions,
			...options
		}

		// Set source
		this._source = new ElasticSearchClient(config)
	}

	/**
	 * Get source property
	 */
	public getSource(): ElasticSearchClient {
		return this._source
	}

	/**
	 * Set index property
	 */
	public setIndex(value: string): void {
		this.index = value
	}

	/**
	 * Get index property
	 */
	public getIndex(): string {
		return this.index
	}

	/**
	 * Get index document count
	 */
	public async count(body: SearchBody = {}): Promise<number> {
		// Send request
		const response = await this._source.count({
			index: this.getIndex(),
			body: body
		})

		// Return count
		return response.body.count
	}

	/**
	 * Check if this index exists
	 */
	public async indexExists(): Promise<boolean> {
		// Send request
		const response = await this._source.indices.exists({ index: this.index })

		// Return bool
		return response.statusCode === 200
	}

	/**
	 * Ping
	 */
	public async ping(): Promise<boolean> {
		// Send request
		const response = await this._source.ping()

		// Return bool
		return response.statusCode === 200
	}

	/**
	 * Search an index
	 * https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_search
	 */
	public async search<T>(
		body: SearchBody,
		options: SearchOptions = {}
	): Promise<SearchResult<T>> {
		// Override default search options
		const config = {
			...defaultSearchOptions,
			...options
		}

		// Send request
		const response = await this._source.search<SearchResponse<T>, SearchBody>({
			index: this.getIndex(),
			_source: config.fields,
			from: config.from,
			size: config.size,
			sort: config.sort,
			body
		})

		// Remp source data function
		const remapHit = (hit: {
			_id: string
			_index: string
			_score: number
			_type: string
			_source: T
		}): Hit<T> => {
			return {
				id: hit._id,
				index: hit._index,
				type: hit._type,
				score: hit._score,
				source: hit._source
			}
		}

		// Return only data that we need
		return {
			count: response.body.hits.hits.length,
			maxScore: response.body.hits.max_score,
			data: response.body.hits.hits.map(remapHit)
		}
	}

	/**
	 * Create index
	 */
	public static async createIndex(
		name: string,
		schema: {},
		options: SourceOptions = {}
	): Promise<boolean> {
		// Override default options
		const config: SourceOptions = {
			...defaultClientOptions,
			...options
		}

		// Init source
		const source = new ElasticSearchClient(config)

		// Create index with given schema mapping
		const response = await source.indices.create({
			index: name,
			body: {
				mappings: {
					properties: schema
				}
			}
		})

		// Return bool
		return response.statusCode === 200
	}

	/**
	 * Add document to index
	 */
	public async add(id: string | number, document: {}): Promise<boolean> {
		// Make sure index exists
		if (!(await this.indexExists())) throw Error(`Missing index: ${this.index}`)

		// Send request
		const response = await this._source.index({
			index: this.getIndex(),
			id: id.toString(),
			body: document
		})

		// Return bool
		return response.statusCode === 201 && response.body.result === 'created'
	}

	/**
	 * Refresh index
	 */
	public async refresh(): Promise<boolean> {
		// Send request
		const response = await this._source.indices.refresh({
			index: this.getIndex()
		})

		// Return bool
		return response.statusCode === 200
	}

	/**
	 * Update index data value
	 */
	public async update(id: string, data: {}): Promise<boolean> {
		// Send request
		const response = await this._source.update({
			index: this.getIndex(),
			id,
			body: {
				doc: data
			}
		})

		// Check if data changed at all
		if (response.statusCode === 200 && response.body.result === 'noop') {
			// Log info
			log.info('Search index not updated, document was identical', {
				index: this.getIndex(),
				id
			})
		}

		// Return bool
		return response.statusCode === 200 && response.body.result === 'updated'
	}

	/**
	 * Delete index
	 */
	public async deleteIndex(): Promise<boolean> {
		// Send request
		const response = await this._source.indices.delete({
			index: this.getIndex()
		})

		// Return bool
		return response.statusCode === 200 && response.body.acknowledged === true
	}
}
