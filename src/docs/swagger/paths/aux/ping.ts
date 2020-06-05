export const pingPath = {
	'/ping': {
		get: {
			tags: ['Aux'],
			summary: 'Check application for network responsiveness.',
			consumes: 'application/json'
		},
		responses: {
			'200': {
				description: 'Returned upon success w/string: "PONG"'
			}
		}
	}
}
