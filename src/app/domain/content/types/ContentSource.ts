import { Source } from '~/lib/util/search/types'
import { Category, Image, Tag } from './'

export interface ContentSource extends Source {
	id?: string
	title?: string
	subtitle?: string
	body?: string
	slug?: string
	category?: Category
	image?: Image
	tag?: Tag[]
}
