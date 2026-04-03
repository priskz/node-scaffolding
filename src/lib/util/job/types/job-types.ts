export interface JobDefinition
{
	name: string
	description: string
	handler: (data: Record<string, unknown>) => Promise<void>
	repeat?: RepeatOptions
	concurrency?: number
}

export interface RepeatOptions
{
	pattern: string
	limit?: number
}

export interface JobInfo
{
	name: string
	description: string
	repeat: RepeatOptions | undefined
	active: boolean
}
