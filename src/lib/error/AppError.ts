/*
 * Base Application Error
 *
 * All structured errors extend this class.
 * Provides a consistent shape for error responses.
 */
export class AppError extends Error
{
	/*
	 * HTTP status code
	 */
	readonly statusCode: number

	/*
	 * Machine-readable error code
	 */
	readonly code: string

	/*
	 * Additional error details
	 */
	readonly details?: Record<string, unknown>

	/*
	 * Constructor
	 */
	constructor(
		message: string,
		statusCode: number = 500,
		code: string = 'INTERNAL_ERROR',
		details?: Record<string, unknown>
	)
	{
		super(message)
		this.name = this.constructor.name
		this.statusCode = statusCode
		this.code = code
		this.details = details

		// Preserve prototype chain
		Object.setPrototypeOf(this, new.target.prototype)
	}

	/*
	 * Serialize for response
	 */
	toJSON(): ErrorResponse
	{
		return {
			code: this.code,
			message: this.message,
			...(this.details ? { details: this.details } : {})
		}
	}
}

export interface ErrorResponse
{
	code: string
	message: string
	details?: Record<string, unknown>
}
