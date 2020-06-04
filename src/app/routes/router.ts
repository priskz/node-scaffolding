import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { config } from '~/config'
import { auth } from './auth'
import { aux } from './aux'

// Init Router
export const router = Router()

// Route Groups
router.use(aux)
router.use('/auth', auth)

// Inline Routes
router.use('/docs', swaggerUi.serve, swaggerUi.setup(config.docs))
