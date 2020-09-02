import { expect } from 'chai'
import fs from 'fs'
import { Logger, LoggerConfig } from './'

//----- Tests -----//

describe('util/Logger', () => {
	// Test Logger
	let testLogger: Logger

	// Test File
	const testFile = './log/app.util-logger-test.log'

	// Test File Log Config
	const testFileConfig: LoggerConfig = {
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

	describe('when given a disabled log', () => {
		// Test file
		const disabledLogTestFile = './log/app.disabled-log-test.log'

		// Test File Log Config
		const disabledFileConfig: LoggerConfig = {
			enable: false,
			transports: [
				{
					type: 'file',
					options: {
						level: 'debug',
						filename: disabledLogTestFile,
						handleExceptions: true,
						maxsize: 5242880, // 5MB
						maxFiles: 5
					}
				}
			]
		}

		// Create file logger
		const testLogger = new Logger(disabledFileConfig)

		// Test
		const msg = {
			error: 'DISABLED-LOG-TEST-ERROR-MESSAGE'
		}

		// Test
		testLogger.error(msg.error)

		it('should NOT log a message to file', async () => {
			expect(fs.readFileSync(disabledLogTestFile, 'utf8')).to.not.include(
				msg.error
			)
		})

		after(async () => {
			// Clean up, remove file if exists
			if (fs.existsSync(disabledLogTestFile)) {
				fs.unlinkSync(disabledLogTestFile)
			}
		})
	})

	describe('when logging methods are called', () => {
		// Create file logger
		const testLogger = new Logger(testFileConfig)

		// Test data
		const msg = {
			emergency: 'TEST-EMERGENCY-MESSAGE',
			alert: 'TEST-ALERT-MESSAGE',
			critical: 'TEST-CRITICAL-MESSAGE',
			error: 'TEST-ERROR-MESSAGE',
			warn: 'TEST-WARN-MESSAGE',
			notice: 'TEST-NOTICE-MESSAGE',
			info: 'TEST-INFO-MESSAGE',
			debug: 'TEST-DEBUG-MESSAGE'
		}

		// Test data
		const testSringData = 'TestStringData'
		const testNumberData = 123456789
		const testObjectData = { test: 'value' }

		// Test log methods
		testLogger.emergency(msg.emergency)
		testLogger.alert(msg.alert)
		testLogger.critical(msg.critical)
		testLogger.error(msg.error)
		testLogger.warn(msg.warn)
		testLogger.notice(msg.notice)
		testLogger.info(msg.info)
		testLogger.debug(msg.debug)
		testLogger.debug(msg.debug, testNumberData)
		testLogger.debug(msg.debug, testSringData)
		testLogger.debug(msg.debug, testObjectData)

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

		it('warn should log a message to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(msg.warn)
			expect(fs.readFileSync(testFile, 'utf8')).to.include('<warn>')
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

		it('debug should log number data to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(
				testNumberData.toString()
			)
		})

		it('debug should log string data to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(testSringData)
		})

		it('debug should log object data as stringified JSON to file', async () => {
			expect(fs.readFileSync(testFile, 'utf8')).to.include(
				JSON.stringify(testObjectData)
			)
		})
	})
})
