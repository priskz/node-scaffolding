import { NextFunction, Request, Response } from 'express'

export async function exception(
	error: Error,
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	console.log(`Exception Handler: ${error.message}`)
	next()
}

export async function test(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	console.log('Test Middleware Fired!')

	next()
}
