import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import type { Queue } from 'bullmq'

/*
 * Create Bull Board Express adapter with all registered queues
 */
function createAdapter(queues: Queue[], basePath: string = '/admin/queues'): ExpressAdapter
{
	// Create Express adapter
	const serverAdapter = new ExpressAdapter()
	serverAdapter.setBasePath(basePath)

	// Create board
	createBullBoard({
		queues: queues.map(q => new BullMQAdapter(q)),
		serverAdapter,
	})

	return serverAdapter
}

export const bullBoard = { createAdapter }
