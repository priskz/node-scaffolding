import { infoPath } from './info'
import { pingPath } from './ping'

export const auxPath = {
	...infoPath,
	...pingPath
}
