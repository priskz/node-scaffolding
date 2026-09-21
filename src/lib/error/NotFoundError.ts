import { AppError } from './AppError'

/*
 * Not Found Error — 404
 *
 * Requested resource does not exist.
 */
export class NotFoundError extends AppError
{
	constructor(message: string = 'Not found')
	{
		super(message, 404, 'NOT_FOUND_ERROR')
	}
}
