export const infoPath = {
	'/info': {
		get: {
			tags: ['Aux'],
			summary: 'Get basic (public) application information',
			consumes: 'application/json'
		},
		responses: {
			'200': {
				description:
					'Returned upon success w/json object of basic app information"'
			}
		}
	}
}
