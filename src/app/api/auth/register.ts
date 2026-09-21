import { Request, Response } from 'express'
import { z } from 'zod'
import { respond } from '~/lib/util'
import { AuthRoot } from '~/app/service'

/*
 * Register Schema
 */
const registerSchema = z.object({
	email: z.string().email(),
	pass: z.string().min(6)
})

export async function register(req: Request, res: Response): Promise<void>
{
	// Validate
	const input = registerSchema.safeParse(req.body)

	// Invalid?
	if( ! input.success)
	{
		respond(req, res).error(input.error.flatten().fieldErrors, 400)
		return
	}

	// Init service
	const service = new AuthRoot()

	// Attempt
	const user = await service.register(input.data)

	// Failed?
	if( ! user)
	{
		respond(req, res).error(null, 400)
		return
	}

	// Success
	respond(req, res).success()
}
