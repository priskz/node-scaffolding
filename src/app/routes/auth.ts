import { Router } from 'express'
import { AuthApi } from '~/app/api'

// Init Root Router
export const auth = Router()

// Controller Routes
auth.route('/login').get(AuthApi.login)
