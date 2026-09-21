import { api, ApiConfig } from './api'
import { app, AppConfig } from './app'
import { cache } from './cache'
import type { CacheConnectionOptions } from '~/lib/util/cache'
import { db, DbConfig } from './database'
import { docs, DocsConfig } from './docs'
import { jobConfig, JobConfig } from './job'
import { log, LogConfig } from './log'
import { mail, MailConfig } from './mail'
import { oauth, OAuthConfig } from './oauth'
import { search, SearchConfig } from './search'
import { session, SessionConfig } from './session'
import { socket, SocketConfig } from './socket'
import { totp, TotpConfig } from './totp'
import { webhook, WebhookConfig } from './webhook'

export const config: ConfigDictionary = {
	api,
	app,
	cache,
	db,
	docs,
	job: jobConfig,
	log,
	mail,
	oauth,
	search,
	session,
	socket,
	totp,
	webhook,
}

interface ConfigDictionary {
	api: ApiConfig
	app: AppConfig
	cache: CacheConnectionOptions
	db: DbConfig
	docs: DocsConfig
	job: JobConfig
	log: LogConfig
	mail: MailConfig
	oauth: OAuthConfig
	search: SearchConfig
	session: SessionConfig
	socket: SocketConfig
	totp: TotpConfig
	webhook: WebhookConfig
}
