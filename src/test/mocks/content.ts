import { v1 as uuid } from 'uuid'
import { Content } from '~/app/domain'
import { ContentService } from '~/app/service/data'

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

async function destroy(id: string): Promise<void> {
	// Init
	const service = new ContentService()

	// Delete
	return await service.delete(id)
}

interface CreateOptions {
	id?: string
	title?: string
	subtitle?: string
	body?: string
	slug?: string
	[key: string]: unknown
}

export const MockContent = {
	create,
	destroy
}
