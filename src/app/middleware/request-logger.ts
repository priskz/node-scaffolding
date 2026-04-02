import { NextFunction, Request, Response } from 'express'
import { log } from '~/lib/util'
import { requestContext } from '~/lib/util/log'

/*
 * Request Logger Middleware
 *
 * Wraps each request in an AsyncLocalStorage context with a unique requestId.
 * Logs the request on completion with method, url, status, and response time.
 *
 * All log entries within the request lifecycle automatically carry the
 * requestId via the LogService mixin — no manual threading required.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void
{
	requestContext.run(() =>
	{
		// Capture start time
		const start = Date.now()

		// Log on response finish
		res.on('finish', () =>
		{
			const duration = Date.now() - start

			log.info({
				method: req.method,
				url: req.originalUrl,
				statusCode: res.statusCode,
				duration,
			}, 'request completed')
		})

		next()
	})
}
