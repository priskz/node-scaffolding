import { createTransport, type Transporter } from 'nodemailer'
import { render } from '@react-email/render'
import { env } from '~/lib/util/env'
import { log } from '~/lib/util/log'
import type { SendOptions, MailResult } from './types'

/*
 * Mail Service
 *
 * Nodemailer transporter with React Email template rendering.
 * Uses Mailpit in development, real SMTP in production.
 */

let transporter: Transporter | undefined

// Lazy child logger
let _mailLog: ReturnType<typeof log.child> | undefined

function mailLog(): ReturnType<typeof log.child>
{
	if( ! _mailLog)
	{
		_mailLog = log.child('MailService')
	}

	return _mailLog
}

/*
 * Initialize the mail transporter
 */
function init(): Transporter
{
	if(transporter)
	{
		return transporter
	}

	// Build auth if credentials provided
	const auth = env.MAIL_USERNAME && env.MAIL_PASSWORD
		? { user: env.MAIL_USERNAME, pass: env.MAIL_PASSWORD }
		: undefined

	// Create transporter
	transporter = createTransport({
		host: env.MAIL_HOST,
		port: env.MAIL_PORT,
		secure: env.MAIL_SECURE === 'true',
		auth,
	})

	mailLog().debug({ host: env.MAIL_HOST, port: env.MAIL_PORT }, 'mail transporter initialized')

	return transporter
}

/*
 * Send an email
 *
 * If a React Email template is provided, it is rendered to HTML.
 * Falls back to raw html/text if no template given.
 */
async function send(options: SendOptions): Promise<MailResult>
{
	// Ensure transporter exists
	const transport = init()

	// Render React Email template if provided
	let html = options.html
	let text = options.text

	if(options.template)
	{
		html = await render(options.template)
		text = await render(options.template, { plainText: true })
	}

	// Build from address
	const from = options.from ?? `${env.MAIL_FROM_NAME} <${env.MAIL_FROM_ADDRESS}>`

	// Send
	const result = await transport.sendMail({
		from,
		to: options.to,
		subject: options.subject,
		html,
		text,
		replyTo: options.replyTo,
	})

	mailLog().info({ messageId: result.messageId, to: options.to }, 'email sent')

	return {
		messageId: result.messageId,
		accepted: result.accepted as string[],
		rejected: result.rejected as string[],
	}
}

/*
 * Verify SMTP connection
 */
async function verify(): Promise<boolean>
{
	try
	{
		const transport = init()
		await transport.verify()
		return true
	}
	catch(error)
	{
		mailLog().error({ error }, 'mail transport verification failed')
		return false
	}
}

/*
 * Shutdown transporter
 */
function close(): void
{
	if(transporter)
	{
		transporter.close()
		transporter = undefined
	}
}

export const mailService = {
	init,
	send,
	verify,
	close,
}
