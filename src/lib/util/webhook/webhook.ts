import { webhookQueue } from './webhook-queue'
import { webhookDispatcher } from './webhook-dispatcher'
import { webhookSigner } from './webhook-signer'

export const webhook = {
	init: webhookQueue.init,
	close: webhookQueue.close,
	dispatcher: webhookDispatcher,
	signer: webhookSigner,
}
