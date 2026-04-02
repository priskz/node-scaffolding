import { AppError } from './AppError'

/*
 * Validation Error — 400
 *
 * Request input failed validation.
 */
export class ValidationError extends AppError
{
	constructor(
		message: string = 'Validation failed',
		details?: Record<string, unknown>
	)
	{
		super(message, 400, 'VALIDATION_ERROR', details)
	}
}
