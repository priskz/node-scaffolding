import axios from 'axios'
import { config } from '~/config'

export const appRequest = axios.create({
	baseURL: `http://localhost:${config.app.port}${config.api.prefix}`,
	validateStatus: () => true
})
