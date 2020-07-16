/* istanbul ignore file */
import {
	Column,
	DeleteDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm'
import { Category } from './Category'
import { Image } from './Image'
import { Tag } from './Tag'

@Entity('content')
export class Content {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column('varchar', { nullable: true })
	title!: string

	@Column('varchar', { nullable: true })
	subtitle!: string

	@Column('text', { nullable: true })
	body!: string

	@Column('varchar', { unique: true })
	slug!: string

	@Column('varchar', { nullable: true })
	categoryId!: string | null

	@Column('varchar', { nullable: true })
	imageId!: string | null

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
		type => Category,
		category => category.content
	)
	category!: Category

	@OneToMany(
		type => Image,
		image => image.content
	)
	image!: Image

	@ManyToMany(
		type => Tag,
		tag => tag.content
	)
	@JoinTable()
	tag!: Tag[]
}
