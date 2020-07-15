import { EntityRepository } from 'typeorm'
import { TypeORMRepository } from '~/lib/domain/TypeORMRepository'
import { User } from './'

@EntityRepository(User)
export class UserRepository extends TypeORMRepository<User> {}
