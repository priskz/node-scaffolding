import { Request, Response } from 'express'
import { AuthRootService } from '~/app/service'

export async function login(req: Request, res: Response): Promise<void> {
	// @todo: Sanitize/validated input
	const email = req.params.email
	const pass = req.params.password

	const service = new AuthRootService()

	const result = await service.login(email, pass)

	res.status(200).json({ auth: 'login' })
}
