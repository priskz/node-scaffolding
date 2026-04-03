import type { ReactElement } from 'react'

/*
 * Options for sending an email
 */
export interface SendOptions
{
	to: string | string[]
	subject: string
	html?: string
	text?: string
	template?: ReactElement
	from?: string
	replyTo?: string
}

/*
 * Result of a sent email
 */
export interface MailResult
{
	messageId: string
	accepted: string[]
	rejected: string[]
}
