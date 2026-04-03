/*
 * Offset-based pagination input
 */
export interface PaginationQuery
{
	page?: number
	perPage?: number
}

/*
 * Offset-based pagination metadata
 */
export interface PaginationMeta
{
	page: number
	perPage: number
	total: number
	totalPages: number
	hasNext: boolean
	hasPrev: boolean
}

/*
 * Offset-based paginated result envelope
 */
export interface PaginatedResult<T>
{
	data: T[]
	meta: PaginationMeta
}

/*
 * Cursor-based pagination input
 */
export interface CursorPaginationQuery
{
	cursor?: string
	limit?: number
}

/*
 * Cursor-based pagination metadata
 */
export interface CursorPaginationMeta
{
	limit: number
	hasNext: boolean
	nextCursor: string | undefined
}

/*
 * Cursor-based paginated result envelope
 */
export interface CursorPaginatedResult<T>
{
	data: T[]
	meta: CursorPaginationMeta
}
