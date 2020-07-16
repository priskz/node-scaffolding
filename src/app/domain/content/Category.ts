/* istanbul ignore file */
import {
	Column,
	DeleteDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm'
import { Content } from './Content'

@Entity('category')
export class Category {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column('varchar', { nullable: false })
	name!: string

	@Column('varchar', { unique: true })
	slug!: string

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
		type => Content,
		content => content.category
	)
	content!: Content
}
