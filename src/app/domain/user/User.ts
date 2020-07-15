/* istanbul ignore file */
import {
	Column,
	DeleteDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm'
import { Session } from '../session'

@Entity('user')
export class User {
	@PrimaryGeneratedColumn()
	id!: number

	@Column('varchar', { unique: true })
	email!: string

	@Column('varchar', { nullable: true })
	password!: string

	@Column('varchar', { nullable: true })
	firstName!: string

	@Column('varchar', { nullable: true })
	lastName!: string

	@Column('varchar', { nullable: true })
	country!: string

	@Column('datetime', { nullable: true })
	birthdate!: Date

	@Column('timestamp', {
		precision: 0,
		default: () => 'CURRENT_TIMESTAMP'
	})
	createdAt!: Date

	@Column('timestamp', {
		precision: 0,
		default: null,
		onUpdate: 'CURRENT_TIMESTAMP'
	})
	updatedAt!: Date

	@DeleteDateColumn({
		precision: 0,
		default: null
	})
	deletedAt!: Date

	//----- Relationships -----//

	@OneToMany(
		() => Session,
		session => session.user
	)
	session!: Session[]
}
