import type { Router } from 'express'

export interface VersionConfig
{
	version: string
	router: Router
	deprecated?: boolean
	sunset?: string
}
