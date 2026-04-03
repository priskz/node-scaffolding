import { api, ApiConfig } from './api'
import { app, AppConfig } from './app'
import { cache } from './cache'
import type { CacheConnectionOptions } from '~/lib/util/cache'
import { db, DbConfig } from './database'
import { docs, DocsConfig } from './docs'
import { log, LogConfig } from './log'
import { mail, MailConfig } from './mail'
import { search, SearchConfig } from './search'
import { schedule, ScheduleConfig } from './schedule'
import { session, SessionConfig } from './session'
import { socket, SocketConfig } from './socket'

export const config: ConfigDictionary = {
	api,
	app,
	cache,
	db,
	docs,
	log,
	mail,
	search,
	session,
	schedule,
	socket,
}

interface ConfigDictionary {
	api: ApiConfig
	app: AppConfig
	cache: CacheConnectionOptions
	db: DbConfig
	docs: DocsConfig
	log: LogConfig
	mail: MailConfig
	search: SearchConfig
	session: SessionConfig
	schedule: ScheduleConfig
	socket: SocketConfig
}
