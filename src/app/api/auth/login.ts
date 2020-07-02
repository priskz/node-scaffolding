import { Request, Response } from 'express'
import { AuthRoot } from '~/app/service'

export async function login(req: Request, res: Response): Promise<void> {
	// @todo: Sanitize/validated input
	const email = req.params.email
	const pass = req.params.password

	const service = new AuthRoot()

	const result = await service.login(email, pass)

	res.status(200).json({ auth: 'login' })
}
