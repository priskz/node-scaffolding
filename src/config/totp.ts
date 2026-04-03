import { env } from '~/lib/util/env'

export interface TotpConfig
{
	enabled: boolean
	issuer: string
	recoveryCodeCount: number
}

export const totp: TotpConfig =
{
	enabled: env.TOTP_ENABLED === 'true',
	issuer: env.TOTP_ISSUER,
	recoveryCodeCount: env.RECOVERY_CODE_COUNT,
}
