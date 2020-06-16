import { expect } from 'chai'
import fs from 'fs'
import { log, Logger, LogConfig } from './'

//----- Tests -----//

describe('util/log', () => {
	// Test File
	const testFile = './log/app.util-log-test.log'

	// Test File Log Config
	const testFileConfig: LogConfig = {
		file: {
			enable: true,
			transports: [
				{
					type: 'file',
					options: {
						level: 'debug',
						filename: testFile,
						handleExceptions: true,
						maxsize: 5242880, // 5MB
						maxFiles: 5
					}
				}
			]
		}
	}

	after(async () => {
		// Clean up
		fs.unlinkSync(testFile)
	})

	describe('when init function is called logger should return an instance of Logger', () => {
		it('should have configured logs in container', async () => {
			// Init
			log.init()

			// Test
			const result = log.logger()

			// Assertions
			expect(result).to.be.an.instanceOf(Logger)
		})
	})

	describe('when logging methods are called', () => {
		// Init file log
		log.init(testFileConfig)

		// Test
		const msg = {
			emergency: 'TEST-EMERGENCY-MESSAGE',
			alert: 'TEST-ALERT-MESSAGE',
			critical: 'TEST-CRITICAL-MESSAGE',
			error: 'TEST-ERROR-MESSAGE',
			warning: 'TEST-WARNING-MESSAGE',
			notice: 'TEST-NOTICE-MESSAGE',
			info: 'TEST-INFO-MESSAGE',
			debug: 'TEST-DEBUG-MESSAGE'
		}

		// Test
		log.emergency(msg.emergency)
		log.alert(msg.alert)
		log.critical(msg.critical)
		log.error(msg.error)
		log.warning(msg.warning)
		log.notice(msg.notice)
		log.info(msg.info)
		log.debug(msg.debug)

		// Assertions
		it('emergency should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.emergency)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<emerg>')
		})

		it('alert should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.alert)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<alert>')
		})

		it('critical should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.critical)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<crit>')
		})

		it('error should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.error)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<error>')
		})

		it('warning should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.warning)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<warning>')
		})

		it('notice should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.notice)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<notice>')
		})

		it('info should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.info)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<info>')
		})

		it('debug should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.debug)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<debug>')
		})
	})
})
