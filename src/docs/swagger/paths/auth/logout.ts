export const logoutPath = {
	'/auth/logout': {
		post: {
			tags: ['Auth'],
			summary: 'Terminates an active user session',
			consumes: 'application/json'
		},
		parameters: [
			{
				$ref: '#/components/parameters/Session'
			}
		],
		responses: {
			'204': {
				description: 'Returned when logout is successful'
			}
		}
	}
}
