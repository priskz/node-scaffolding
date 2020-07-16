export const search: SearchConfig = {
	index: {
		default:
			process.env.NODE_ENV === 'production'
				? 'prod-global-index'
				: 'dev-global-index'
	}
}

export interface SearchConfig {
	index: {
		default: string
	}
}
