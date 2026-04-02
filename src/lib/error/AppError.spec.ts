import { describe, it, expect } from 'vitest'
import { AppError } from './AppError'
import { ValidationError } from './ValidationError'
import { AuthenticationError } from './AuthenticationError'
import { ForbiddenError } from './ForbiddenError'
import { NotFoundError } from './NotFoundError'
import { ConflictError } from './ConflictError'

describe('lib/error', () =>
{
	describe('AppError', () =>
	{
		it('should create an error with defaults', () =>
		{
			// Action
			const error = new AppError('Something broke')

			// Assert
			expect(error.message).toBe('Something broke')
			expect(error.statusCode).toBe(500)
			expect(error.code).toBe('INTERNAL_ERROR')
			expect(error.details).toBeUndefined()
			expect(error).toBeInstanceOf(Error)
			expect(error).toBeInstanceOf(AppError)
		})

		it('should serialize to JSON without details', () =>
		{
			// Action
			const error = new AppError('fail', 400, 'BAD')
			const json = error.toJSON()

			// Assert
			expect(json).toEqual({
				code: 'BAD',
				message: 'fail'
			})
			expect(json).not.toHaveProperty('details')
		})

		it('should serialize to JSON with details', () =>
		{
			// Init
			const details = { field: 'email', reason: 'invalid' }

			// Action
			const error = new AppError('fail', 400, 'BAD', details)
			const json = error.toJSON()

			// Assert
			expect(json.details).toEqual(details)
		})
	})

	describe('ValidationError', () =>
	{
		it('should default to 400 with VALIDATION_ERROR code', () =>
		{
			// Action
			const error = new ValidationError()

			// Assert
			expect(error.statusCode).toBe(400)
			expect(error.code).toBe('VALIDATION_ERROR')
			expect(error.message).toBe('Validation failed')
			expect(error).toBeInstanceOf(AppError)
		})
	})

	describe('AuthenticationError', () =>
	{
		it('should default to 401 with AUTHENTICATION_ERROR code', () =>
		{
			// Action
			const error = new AuthenticationError()

			// Assert
			expect(error.statusCode).toBe(401)
			expect(error.code).toBe('AUTHENTICATION_ERROR')
		})
	})

	describe('ForbiddenError', () =>
	{
		it('should default to 403 with FORBIDDEN_ERROR code', () =>
		{
			// Action
			const error = new ForbiddenError()

			// Assert
			expect(error.statusCode).toBe(403)
			expect(error.code).toBe('FORBIDDEN_ERROR')
		})
	})

	describe('NotFoundError', () =>
	{
		it('should default to 404 with NOT_FOUND_ERROR code', () =>
		{
			// Action
			const error = new NotFoundError()

			// Assert
			expect(error.statusCode).toBe(404)
			expect(error.code).toBe('NOT_FOUND_ERROR')
		})
	})

	describe('ConflictError', () =>
	{
		it('should default to 409 with CONFLICT_ERROR code', () =>
		{
			// Action
			const error = new ConflictError()

			// Assert
			expect(error.statusCode).toBe(409)
			expect(error.code).toBe('CONFLICT_ERROR')
		})
	})
})
