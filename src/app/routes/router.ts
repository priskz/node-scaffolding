import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { config } from '~/config'
import { auth } from './auth'
import { aux } from './aux'
import { session } from './session'

// Init Router
export const router = Router()

// Route Groups
router.use('/', aux)
router.use('/auth', auth)
router.use('/session', session)

// Inline Routes
router.use('/docs', swaggerUi.serve, swaggerUi.setup(config.docs))
