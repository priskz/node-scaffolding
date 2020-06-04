import { Request, Response } from 'express'

export async function ping(req: Request, res: Response): Promise<void> {
	res.status(200).json('PONG')
}

// Sync Example
export const pingSync = function(req: Request, res: Response): void {
	res.status(200).json('PONG SYNC')
}
