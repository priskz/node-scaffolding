import { NextFunction, Request, Response } from 'express'

export class Responder {
	/*
	 * Express Request
	 */
	private request: Request

	/*
	 * Express Response
	 */
	private response: Response

	/*
	 * Express NextFunction
	 */
	private next: NextFunction | undefined

	/*
	 * Constructor
	 */
	constructor(request: Request, response: Response, next?: NextFunction) {
		this.request = request
		this.response = response
		this.next = next
	}

	/*
	 * Success Response - 200 || 204
	 */
	public success(data?: any, code: number = 200): void {
		// Flip 200 to 204 if no data given
		if (!data && code === 200) code = 204

		// Send response
		this.send(code, data)
	}

	/*
	 * Error Response - 400
	 */
	public error(data?: any, code: number = 400): void {
		// Send response
		this.send(code, data)
	}

	/*
	 * Unexpected Exception Response - 500
	 */
	public exception(data?: any, code: number = 500): void {
		// Send response
		this.send(code, data)
	}

	/*
	 * Send Response
	 */
	public send(code: number, data?: {}): void {
		// Execute the response
		this.response.status(code).json(data)

		// Run any "after" middleware if configured
		if (this.next) this.next()
	}

	/*
	 * Redirect Response
	 */
	public redirect(to: string, permanent = false): void {
		// Set code
		const code = permanent ? 301 : 302

		// Set redirect header
		this.response.setHeader('Location', to)

		// Execute response
		this.response.status(code).send()

		// Run any "after" middleware if configured
		if (this.next) this.next()
	}
}
