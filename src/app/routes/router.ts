import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { config } from '~/config'
import { admin } from './admin'
import { auth } from './auth'
import { aux } from './aux'
import { session } from './session'
import { search } from './search'

// Init Router
export const router = Router()

// Route Groups
router.use('/', aux)
router.use('/admin', admin)
router.use('/auth', auth)
router.use('/session', session)
router.use('/search', search)

// Inline Routes
router.use('/docs', swaggerUi.serve, swaggerUi.setup(config.docs))
