import { AdvancedWhereClause } from './AdvancedWhereClause'

export type WhereClause<T> = {
	[P in keyof T]?: string | number | Date | AdvancedWhereClause
}
