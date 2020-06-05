import { Request, Response, NextFunction } from 'express'
import { Responder } from './Responder'

/*
 * Export Util
 */
export const respond = (req: Request, res: Response, next?: NextFunction) => {
	return new Responder(req, res, next)
}
