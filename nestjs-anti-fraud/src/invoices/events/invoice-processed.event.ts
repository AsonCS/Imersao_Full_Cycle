import { FraudReason, Invoice } from 'generated/prisma'

export class InvoiceProcessedEvent {
	constructor(
		readonly invoice: Invoice,
		readonly fraudResult: {
			hasFraud: boolean
			reason?: FraudReason
			description?: string
		}
	) {}
}
