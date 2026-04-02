import rateLimit from 'express-rate-limit'
import { env } from '~/lib/util'

/*
 * Global Rate Limiter
 *
 * Configurable via env vars.
 * Default: 100 requests per 15 minutes per IP.
 */
export const rateLimiter = rateLimit({
	windowMs: env.RATE_LIMIT_WINDOW_MS,
	max: env.RATE_LIMIT_MAX,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		code: 'RATE_LIMIT_EXCEEDED',
		message: 'Too many requests, please try again later'
	}
})

/*
 * Strict Rate Limiter — for auth endpoints
 *
 * 10 attempts per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
	windowMs: 900000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		code: 'RATE_LIMIT_EXCEEDED',
		message: 'Too many authentication attempts, please try again later'
	}
})
