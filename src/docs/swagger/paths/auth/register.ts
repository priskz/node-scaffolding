export const registerPath = {
	'/auth/register': {
		post: {
			tags: ['Auth'],
			summary: 'Registers a new user',
			consumes: 'application/json',
			parameters: [
				{
					in: 'body',
					name: 'email',
					description: 'The email address for the user',
					required: true,
					format: 'email',
					type: 'string'
				},
				{
					in: 'body',
					name: 'pass',
					description: "The user's password",
					required: true,
					format: 'password',
					type: 'string',
					example: 'mypassword47',
					minLength: 3
				},
				{
					in: 'body',
					name: 'firstName',
					description: "The user's first name",
					required: true,
					type: 'string',
					example: 'Aaron'
				},
				{
					in: 'body',
					name: 'lastName',
					description: "The user's last name",
					required: true,
					type: 'string',
					example: 'Rodgers'
				}
			],
			responses: {
				'204': {
					description: 'Returned when login is successful'
				}
			}
		}
	}
}
