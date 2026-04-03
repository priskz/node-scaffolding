import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import type { VersionConfig } from './types'

const _versions: Map<string, VersionConfig> = new Map()
let _currentVersion: string = 'v1'

/*
 * Register a versioned API router
 */
function register(config: VersionConfig): void
{
	_versions.set(config.version, config)
}

/*
 * Set the current (latest) version
 */
function setCurrent(version: string): void
{
	_currentVersion = version
}

/*
 * Get the current version string
 */
function getCurrent(): string
{
	return _currentVersion
}

/*
 * Get all registered versions
 */
function getVersions(): VersionConfig[]
{
	return Array.from(_versions.values())
}

/*
 * Mount all versioned routers onto a parent router
 * Each version is mounted at /api/{version}/
 */
function mount(parent: Router, prefix: string): void
{
	for(const [version, config] of _versions)
	{
		// Deprecated version?
		if(config.deprecated)
		{
			parent.use(`${prefix}${version}`, deprecationHeaders(config), config.router)
		}
		else
		{
			parent.use(`${prefix}${version}`, config.router)
		}
	}
}

/*
 * Middleware that adds deprecation headers to responses
 */
function deprecationHeaders(config: VersionConfig): (req: Request, res: Response, next: NextFunction) => void
{
	return function(_req: Request, res: Response, next: NextFunction): void
	{
		res.setHeader('Deprecation', 'true')
		res.setHeader('Link', `</api/${_currentVersion}>; rel="successor-version"`)

		if(config.sunset)
		{
			res.setHeader('Sunset', config.sunset)
		}

		next()
	}
}

/*
 * Reset all versions — for testing
 */
function reset(): void
{
	_versions.clear()
	_currentVersion = 'v1'
}

export const versioning = { register, setCurrent, getCurrent, getVersions, mount, reset }
