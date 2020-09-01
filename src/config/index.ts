import { api, ApiConfig } from './api'
import { app, AppConfig } from './app'
import { cache, CacheConfig } from './cache'
import { db, DbConfig } from './database'
import { docs, DocsConfig } from './docs'
import { log, LogConfig } from './log'
import { search, SearchConfig } from './search'
import { schedule, ScheduleConfig } from './schedule'
import { session, SessionConfig } from './session'

export const config: ConfigDictionary = {
	api,
	app,
	cache,
	db,
	docs,
	log,
	search,
	session,
	schedule
}

interface ConfigDictionary {
	api: ApiConfig
	app: AppConfig
	cache: CacheConfig
	db: DbConfig
	docs: DocsConfig
	log: LogConfig
	search: SearchConfig
	session: SessionConfig
	schedule: ScheduleConfig
}
