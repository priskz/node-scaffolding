/*
 * Task Status Constants
 */
export const TASK_STATUS = {
	FAIL: 'fail' as TaskStatus,
	SUCCESS: 'success' as TaskStatus,
	UNKNOWN: 'unknown' as TaskStatus
}

/*
 * Task Status Types
 */
export type TaskStatus = 'fail' | 'success' | 'unknown'
