export interface TotpSetupResult
{
	secret: string
	uri: string
	recoveryCodes: string[]
}

export interface TotpVerifyResult
{
	valid: boolean
}
