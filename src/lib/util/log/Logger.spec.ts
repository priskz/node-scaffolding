import { expect } from 'chai'
import fs from 'fs'
import { Logger, LogConfig } from './'

//----- Tests -----//

describe('util/Logger', () => {
	// Test Logger
	let testLogger: Logger

	// Test File
	const testFile = './log/app.util-logger-test.log'

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

	describe('when constructor is called with no arguments', () => {
		it('should create a new instance of Logger w/ default console logging', async () => {
			// Test
			testLogger = new Logger()

			// Assertions
			expect(testLogger).to.be.an.instanceOf(Logger)
		})
	})

	describe('when logging methods are called', () => {
		// Create file logger
		const testLogger = new Logger(testFileConfig)

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
		testLogger.emergency(msg.emergency)
		testLogger.alert(msg.alert)
		testLogger.critical(msg.critical)
		testLogger.error(msg.error)
		testLogger.warning(msg.warning)
		testLogger.notice(msg.notice)
		testLogger.info(msg.info)
		testLogger.debug(msg.debug)

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
