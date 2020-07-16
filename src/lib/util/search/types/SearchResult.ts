import { Hit } from './'

export interface SearchResult<T> {
	count: number // Hit count
	maxScore: number | null // Highest returned document _score. This value is null for requests that do not sort by _score
	data: Hit<T>[] // Contains returned documents and metadata
}
