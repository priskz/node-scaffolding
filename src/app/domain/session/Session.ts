/* istanbul ignore file */
import {
	BaseEntity,
	Column,
	DeleteDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm'
import { User } from '../user'

@Entity('session')
export class Session extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column('integer', { nullable: true })
	userId!: number | null

	@Column('varchar', { nullable: true })
	agent!: string

	@Column('varchar', { nullable: true })
	ipAddress!: string

	@Column('timestamp', {
		precision: 0,
		nullable: true,
		default: null
	})
	expiresAt!: Date

	@Column('timestamp', {
		precision: 0,
		default: () => 'CURRENT_TIMESTAMP'
	})
	activeAt!: Date

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

	@ManyToOne(
		() => User,
		user => user.session,
		{ onDelete: 'CASCADE' }
	)
	user!: User
}
