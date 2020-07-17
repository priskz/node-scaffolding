import { v1 as uuid } from 'uuid'
import { Content } from '~/app/domain'
import { ContentService } from '~/app/service/data'
import { ContentSeed } from '~/test/seeds'

/*
 * Create
 */
async function create(
	options: CreateOptions = {}
): Promise<Content | undefined> {
	// Set default prop values and then update with given overrides
	const option: CreateOptions = {
		title: 'Random Content Title',
		subtitle: 'Random Content Title',
		body:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sed dolor est. Nam convallis aliquet purus, at lacinia orci iaculis et. Quisque euismod eget ipsum in porttitor. Quisque non finibus erat. In vel faucibus augue. Praesent eget nulla ultrices, tincidunt purus eget, mollis neque. Proin tincidunt vehicula leo, finibus feugiat neque imperdiet sit amet. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		slug: uuid(),
		...options
	}

	// Init
	const service = new ContentService()

	// Create
	return await service.create(option)
}

/*
 * Destroy
 */
async function destroy(id: string): Promise<void> {
	// Init
	const service = new ContentService()

	// Delete
	return await service.delete(id)
}

/*
 * Add all seeds to database
 */
async function addSeeds(): Promise<void> {
	// Init
	const service = new ContentService()

	// Get seed data
	const seeds = ContentSeed.getSeeds()

	// Iterate seeds
	for (let i = 0; i < seeds.length; i++) {
		// Create
		await service.create({
			id: seeds[i].id,
			title: seeds[i].title,
			subtitle: seeds[i].subtitle,
			slug: seeds[i].slug,
			body: seeds[i].body
		})
	}
}

/*
 * Remove all seeds from database
 */
async function removeSeeds(): Promise<void> {
	// Init
	const service = new ContentService()

	// Get seed data
	const seeds = ContentSeed.getSeeds()

	// Iterate seeds
	for (let i = 0; i < seeds.length; i++) {
		// Delete
		await service.delete(seeds[i].id as string)
	}
}

/*
 * Export
 */
export const MockContent = {
	create,
	destroy,
	addSeeds,
	removeSeeds,
	getSeeds: function() {
		return ContentSeed.getSeeds()
	}
}

interface CreateOptions {
	id?: string
	title?: string
	subtitle?: string
	body?: string
	slug?: string
	[key: string]: unknown
}
