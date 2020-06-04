import { before, after } from 'mocha'
import { server } from './server'
import chai from 'chai'
import chaiLike from 'chai-like'
import chaiThings from 'chai-things'
import chaiAsPromised from 'chai-as-promised'
import chaiEach from 'chai-each'

before(async () => {
	chai.should()
	chai.use(chaiLike)
	chai.use(chaiThings)
	chai.use(chaiEach)
	chai.use(chaiAsPromised) // This should always be added last

	await server.start()
})

after(async () => {
	await server.stop()
})
