import { loginPath } from './login'
import { logoutPath } from './logout'
import { registerPath } from './register'

export const authPath = {
	...loginPath,
	...logoutPath,
	...registerPath
}
