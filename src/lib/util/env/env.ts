/*
 * Export Util
 */
export function env(name: string, fallback?: any, cast?: CastOption): any {
	let value: any = process.env[name]

	if (typeof value === 'undefined') {
		if (typeof fallback === 'undefined') {
			throw new Error(name + ' is not defined')
		} else {
			value = fallback
		}
	}

	switch (cast) {
		case 'bool':
			value = process.env[name] === 'true'
			break

		case 'array':
		case '[]':
			value = value.split(',')
			break

		case 'int':
			value = parseInt(value)
			break

		default:
			switch (process.env[name]) {
				case 'true':
					value = true
					break

				case 'false':
					value = false
					break
			}
	}

	return value
}

type CastOption = 'bool' | 'array' | '[]' | 'int'
