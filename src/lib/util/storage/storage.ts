import { env } from '~/lib/util/env'
import { localDriver } from './drivers/local'
import { s3Driver } from './drivers/s3'
import type { StorageDriver } from './types'

/*
 * Storage Facade
 *
 * Global access point for file storage operations.
 * Selects the appropriate driver based on STORAGE_DRIVER env var.
 *
 * Usage:
 *   import { storage } from '~/lib/util'
 *   await storage.upload('avatars/user-42.png', buffer)
 *   const file = await storage.download('avatars/user-42.png')
 *   const url = await storage.url('avatars/user-42.png', { expiresIn: 3600 })
 */

let driver: StorageDriver

/*
 * Get the active storage driver
 *
 * Lazily initializes based on STORAGE_DRIVER env var.
 */
function getDriver(): StorageDriver
{
	if( ! driver)
	{
		switch(env.STORAGE_DRIVER)
		{
			case 's3':
				driver = s3Driver
				break

			case 'local':
			default:
				driver = localDriver
				break
		}
	}

	return driver
}

export const storage: StorageDriver = {
	upload: (...args) => getDriver().upload(...args),
	download: (...args) => getDriver().download(...args),
	delete: (...args) => getDriver().delete(...args),
	exists: (...args) => getDriver().exists(...args),
	url: (...args) => getDriver().url(...args),
}
