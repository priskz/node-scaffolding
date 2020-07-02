import axios from 'axios'
import { config } from '~/config'

/*
 * App Request
 */
export const appRequest = axios.create({
	baseURL: `http://localhost:${config.app.port}${config.api.prefix}${config.api.version}`,
	validateStatus: () => true
})

/*
 * Extract uuid from cookie header
 */
export function getSessionIdFromHeader(header: string): string {
	return header
		.split(';')[0]
		.replace(`${config.session.cookie}=s%3A`, '')
		.split('.')[0]
}

/*
 * Pause
 */
export function pause(ms = 500): Promise<void> {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}
