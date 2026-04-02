import { Request, Response } from 'express'
import { z } from 'zod'
import { respond } from '~/lib/util'
import { config } from '~/config'
import { AuthRoot } from '~/app/service'

/*
 * Login Schema
 */
const loginSchema = z.object({
	email: z.string().email(),
	pass: z.string().min(1)
})

export async function login(req: Request, res: Response): Promise<void>
{
	// Session have a user?
	if(req.getUser())
	{
		respond(req, res).error()
		return
	}

	// Validate
	const input = loginSchema.safeParse(req.body)

	// Invalid?
	if( ! input.success)
	{
		respond(req, res).error(input.error.flatten().fieldErrors, 400)
		return
	}

	// Init service
	const service = new AuthRoot()

	// Attempt login
	const session = await service.login(
		req.getSession(),
		input.data.email,
		input.data.pass
	)

	// Failed login?
	if( ! session)
	{
		respond(req, res).error(null, 401)
		return
	}

	// Update req session
	req.setSession(session)

	// Update response cookie
	await res.cookie(config.session.cookie, session.id, {
		expires: session.expiresAt ?? undefined,
		sameSite: 'strict',
		signed: true
	})

	// Success
	respond(req, res).success()
}
