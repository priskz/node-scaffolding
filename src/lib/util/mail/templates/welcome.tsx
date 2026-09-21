import * as React from 'react'

/*
 * Welcome Email Template
 *
 * Sent to new users after registration.
 * Uses React Email component model for responsive HTML output.
 */

interface WelcomeEmailProps
{
	name: string
	loginUrl?: string
}

export function WelcomeEmail({ name, loginUrl = '#' }: WelcomeEmailProps): React.ReactElement
{
	return (
		<div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
			<h1 style={{ color: '#333' }}>Welcome, {name}!</h1>
			<p style={{ color: '#555', lineHeight: '1.6' }}>
				Your account has been created successfully. You can now log in and start using the platform.
			</p>
			<a
				href={loginUrl}
				style={{
					display: 'inline-block',
					padding: '12px 24px',
					backgroundColor: '#0066cc',
					color: '#ffffff',
					textDecoration: 'none',
					borderRadius: '4px',
					marginTop: '16px',
				}}
			>
				Log In
			</a>
			<p style={{ color: '#999', fontSize: '12px', marginTop: '32px' }}>
				If you did not create this account, please ignore this email.
			</p>
		</div>
	)
}
