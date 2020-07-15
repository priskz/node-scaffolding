import { EntityRepository } from 'typeorm'
import { TypeORMRepository } from '~/lib/domain/TypeORMRepository'
import { Session } from './'

@EntityRepository(Session)
export class SessionRepository extends TypeORMRepository<Session> {}
