/*
 * Run Status Constants
 */
export const RUN_STATUS = {
	READY: 'ready' as RunStatus,
	STARTED: 'started' as RunStatus,
	FINISHED: 'finished' as RunStatus
}

/*
 * Run Status Types
 */
export type RunStatus = 'ready' | 'started' | 'finished'
