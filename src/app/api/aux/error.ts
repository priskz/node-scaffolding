import { Request, Response } from 'express'

export async function error(req: Request, res: Response): Promise<void> {
	// Throw an error with given message, otherwise default
	throw Error(req.body.message ? req.body.message : '/error api - No Message')
}
