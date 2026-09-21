import { AppError } from './AppError'

/*
 * Forbidden Error — 403
 *
 * Authenticated but not authorized for this action.
 */
export class ForbiddenError extends AppError
{
	constructor(message: string = 'Forbidden')
	{
		super(message, 403, 'FORBIDDEN_ERROR')
	}
}
