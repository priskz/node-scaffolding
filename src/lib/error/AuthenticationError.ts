import { AppError } from './AppError'

/*
 * Authentication Error — 401
 *
 * Request lacks valid authentication credentials.
 */
export class AuthenticationError extends AppError
{
	constructor(message: string = 'Authentication required')
	{
		super(message, 401, 'AUTHENTICATION_ERROR')
	}
}
