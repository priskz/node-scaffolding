import { AsyncLocalStorage } from 'async_hooks'
import { randomUUID } from 'crypto'

/*
 * Request Context
 *
 * Provides per-request storage via AsyncLocalStorage.
 * The requestId is generated once per HTTP request and threaded
 * through all log entries within that request lifecycle.
 */

interface RequestStore
{
	requestId: string
}

const storage = new AsyncLocalStorage<RequestStore>()

/*
 * Run a function within a request context
 *
 * Generates a new requestId and makes it available to all
 * async operations within the callback scope.
 */
function run<T>(fn: () => T, requestId?: string): T
{
	const store: RequestStore = {
		requestId: requestId ?? randomUUID(),
	}

	return storage.run(store, fn)
}

/*
 * Get the current request ID
 *
 * Returns the requestId for the current async context,
 * or undefined if called outside a request scope.
 */
function getRequestId(): string | undefined
{
	return storage.getStore()?.requestId
}

/*
 * Get the full request store
 */
function getStore(): RequestStore | undefined
{
	return storage.getStore()
}

export const requestContext = { run, getRequestId, getStore }
