export interface Hit<T> {
	index: string
	type: string
	id: string
	score: number
	source: T
}
