import bcrypt from 'bcrypt'

/*
 * Salt rounds
 */
const saltRounds = 12

/*
 * Check/verify hash
 */
async function hashCheck(value: string, hash: string): Promise<boolean> {
	return await bcrypt.compareSync(value, hash)
}

/*
 * Create a hash
 */
async function hashMake(value: string): Promise<string> {
	return await bcrypt.hashSync(value, await bcrypt.genSaltSync(saltRounds))
}

/*
 * Export Util
 */
export const crypt: Crypt = {
	hash: {
		check: hashCheck,
		make: hashMake
	}
}

interface Hash {
	check: (value: string, hash: string) => Promise<boolean>
	make: (value: string) => Promise<string>
}

interface Crypt {
	hash: Hash
}
