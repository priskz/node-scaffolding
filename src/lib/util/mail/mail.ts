import { mailService } from './mail-service'
import type { SendOptions, MailResult } from './types'

/*
 * Mail Facade
 *
 * Global mail interface for the application.
 * Delegates to mailService for transporter management.
 */

/*
 * Send an email
 */
async function send(options: SendOptions): Promise<MailResult>
{
	return mailService.send(options)
}

/*
 * Verify SMTP connection
 */
async function verify(): Promise<boolean>
{
	return mailService.verify()
}

/*
 * Shutdown mail transporter
 */
function close(): void
{
	mailService.close()
}

export const mail = {
	send,
	verify,
	close,
}
