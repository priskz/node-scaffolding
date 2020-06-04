export const loginPath = {
	'/auth/login': {
		post: {
			tags: ['Auth'],
			summary: 'Authenticates a user',
			consumes: 'application/json',
			parameters: [
				{
					in: 'body',
					name: 'email',
					description: 'The email address for the user',
					required: true,
					type: 'string',
					format: 'email'
				},
				{
					in: 'body',
					name: 'pass',
					description: "The user's password",
					required: true,
					type: 'string',
					format: 'password',
					example: 'mypassword47'
				}
			],
			responses: {
				'401': {
					description: 'Returned when login is invalid'
				}
			}
		}
	}
}
