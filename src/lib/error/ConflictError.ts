import { AppError } from './AppError'

/*
 * Conflict Error — 409
 *
 * Request conflicts with current server state.
 */
export class ConflictError extends AppError
{
	constructor(message: string = 'Conflict')
	{
		super(message, 409, 'CONFLICT_ERROR')
	}
}
