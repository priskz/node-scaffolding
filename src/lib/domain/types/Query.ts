import { AdvancedWhereClause, WhereClause } from './'

export interface Query<T> {
	select?: (keyof T)[] | undefined
	order?: {
		[P in keyof T]?: 'ASC' | 'DESC'
	}
	where?:
		| WhereClause<T>
		| WhereClause<T>[]
		| AdvancedWhereClause
		| AdvancedWhereClause[]
		| Array<WhereClause<T> | AdvancedWhereClause>
	embed?: string[]
	skip?: number
	take?: number
}
