import axios from 'axios'
import { config } from '~/config'

/*
 * Pause
 */
export const appRequest = axios.create({
	baseURL: `http://localhost:${config.app.port}${config.api.prefix}${config.api.version}`,
	validateStatus: () => true
})

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
