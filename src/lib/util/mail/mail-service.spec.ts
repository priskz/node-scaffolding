import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

/*
 * Mail Service Tests
 *
 * Mocks Nodemailer and React Email render — no real SMTP calls.
 * Verifies send, template rendering, and verify lifecycle.
 */

// Mock env
vi.mock('~/lib/util/env', () => ({
	env: {
		MAIL_HOST: 'localhost',
		MAIL_PORT: 1025,
		MAIL_USERNAME: undefined,
		MAIL_PASSWORD: undefined,
		MAIL_FROM_NAME: 'TestApp',
		MAIL_FROM_ADDRESS: 'test@example.com',
		MAIL_SECURE: 'false',
		NODE_ENV: 'test',
		LOG_LEVEL: 'error',
		LOG_CONSOLE_PRETTY: 'false',
		LOG_DESTINATIONS: 'console',
	},
}))

// Mock log
vi.mock('~/lib/util/log', () => ({
	log: {
		child: () => ({
			debug: vi.fn(),
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
		}),
	},
}))

// Mock nodemailer
const mockSendMail = vi.fn()
const mockVerify = vi.fn()
const mockClose = vi.fn()

vi.mock('nodemailer', () => ({
	createTransport: () => ({
		sendMail: mockSendMail,
		verify: mockVerify,
		close: mockClose,
	}),
}))

// Mock @react-email/render
vi.mock('@react-email/render', () => ({
	render: vi.fn().mockImplementation((_element: unknown, options?: { plainText?: boolean }) =>
	{
		if(options?.plainText)
		{
			return Promise.resolve('plain text version')
		}
		return Promise.resolve('<html>rendered template</html>')
	}),
}))

describe('mailService', () =>
{
	let mailService: typeof import('./mail-service').mailService

	beforeEach(async () =>
	{
		vi.clearAllMocks()

		// Fresh import
		const mod = await import('./mail-service')
		mailService = mod.mailService
	})

	it('should send an email with raw html', async () =>
	{
		mockSendMail.mockResolvedValueOnce({
			messageId: '<test-123@example.com>',
			accepted: ['user@example.com'],
			rejected: [],
		})

		const result = await mailService.send({
			to: 'user@example.com',
			subject: 'Test Email',
			html: '<p>Hello</p>',
		})

		expect(result.messageId).toBe('<test-123@example.com>')
		expect(result.accepted).toEqual(['user@example.com'])
		expect(mockSendMail).toHaveBeenCalledOnce()
		expect(mockSendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'user@example.com',
				subject: 'Test Email',
				html: '<p>Hello</p>',
				from: 'TestApp <test@example.com>',
			})
		)
	})

	it('should render a React Email template', async () =>
	{
		mockSendMail.mockResolvedValueOnce({
			messageId: '<template-456@example.com>',
			accepted: ['user@example.com'],
			rejected: [],
		})

		// Simple React element as template
		const template = React.createElement('div', null, 'Welcome!')

		const result = await mailService.send({
			to: 'user@example.com',
			subject: 'Welcome',
			template,
		})

		expect(result.messageId).toBe('<template-456@example.com>')
		expect(mockSendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				html: '<html>rendered template</html>',
				text: 'plain text version',
			})
		)
	})

	it('should use custom from address when provided', async () =>
	{
		mockSendMail.mockResolvedValueOnce({
			messageId: '<custom-from@example.com>',
			accepted: ['user@example.com'],
			rejected: [],
		})

		await mailService.send({
			to: 'user@example.com',
			subject: 'Custom From',
			html: '<p>Hi</p>',
			from: 'Custom <custom@example.com>',
		})

		expect(mockSendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'Custom <custom@example.com>',
			})
		)
	})

	it('should verify SMTP connection', async () =>
	{
		mockVerify.mockResolvedValueOnce(true)

		const result = await mailService.verify()

		expect(result).toBe(true)
	})

	it('should return false when verify fails', async () =>
	{
		mockVerify.mockRejectedValueOnce(new Error('SMTP unreachable'))

		const result = await mailService.verify()

		expect(result).toBe(false)
	})

	it('should send to multiple recipients', async () =>
	{
		mockSendMail.mockResolvedValueOnce({
			messageId: '<multi-789@example.com>',
			accepted: ['a@example.com', 'b@example.com'],
			rejected: [],
		})

		const result = await mailService.send({
			to: ['a@example.com', 'b@example.com'],
			subject: 'Multi',
			html: '<p>Hi all</p>',
		})

		expect(result.accepted).toHaveLength(2)
	})
})
