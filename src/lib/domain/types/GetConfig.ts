import { Query } from './'

export interface GetConfig<T> {
	query?: Query<T>
	count?: boolean
	loadEagerRelations?: boolean
}
