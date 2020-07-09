export const session: SessionConfig = {
	cookie: 'session',
	duration: {
		guest: 30,
		user: 90
	}
}

export interface SessionConfig {
	cookie: string
	duration: {
		guest: number
		user: number
	}
}
