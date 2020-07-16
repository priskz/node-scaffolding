/**
 * Schema Mapping for ElasticSearch
 * Note: See url below for all possible data types
 * https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html
 */
// TODO: Test performance of changing nested objects to: type: "flattened"
export const ContentSchema = {
	id: {
		type: 'keyword'
	},
	title: {
		type: 'text'
	},
	subtitle: {
		type: 'text'
	},
	body: {
		type: 'text'
	},
	slug: {
		type: 'keyword'
	},
	image: {
		properties: {
			id: {
				type: 'keyword'
			},
			title: {
				type: 'text'
			},
			url: {
				type: 'keyword'
			},
			description: {
				type: 'text'
			}
		}
	},
	category: {
		properties: {
			id: {
				type: 'keyword'
			},
			name: {
				type: 'text'
			},
			slug: {
				type: 'keyword'
			}
		}
	},
	tag: {
		properties: {
			id: {
				type: 'keyword'
			},
			name: {
				type: 'text'
			},
			slug: {
				type: 'keyword'
			}
		}
	}
}
