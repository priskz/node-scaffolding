import { env } from '~/lib/util'

/*
 * Mail Config
 *
 * SMTP connection settings for Nodemailer.
 * Uses Mailpit (localhost:1025) in development.
 */
export const mail: MailConfig = {
	host: env.MAIL_HOST,
	port: env.MAIL_PORT,
	secure: env.MAIL_SECURE === 'true',
	from: {
		name: env.MAIL_FROM_NAME,
		address: env.MAIL_FROM_ADDRESS,
	},
}

export interface MailConfig
{
	host: string
	port: number
	secure: boolean
	from: {
		name: string
		address: string
	}
}
