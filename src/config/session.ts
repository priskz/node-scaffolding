export const session: SessionConfig = {
	cookie: 'session',
	duration: {
		guest: 30,
		user: 180
	},
	expiration: {
		minRefreshDays: 1
	}
}

export interface SessionConfig {
	cookie: string
	duration: {
		guest: number
		user: number
	}
	expiration: {
		minRefreshDays: number
	}
}
