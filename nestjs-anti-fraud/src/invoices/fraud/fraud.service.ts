import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ProcessInvoiceFraudDto } from '../dto/process-invoice-fraud.dto'
import { InvoiceStatus } from 'generated/prisma'
import { FraudAggregateSpecification } from './specifications/fraud-aggregate.specification'

@Injectable()
export class FraudService {
	constructor(
		private readonly fraudAggregateSpec: FraudAggregateSpecification,
		private readonly prismaService: PrismaService
	) {}

	async processInvoice({ account_id, amount, invoice_id }: ProcessInvoiceFraudDto) {
		const invoice = await this.prismaService.invoice.findUnique({
			where: {
				id: invoice_id,
			},
		})
		if (invoice) {
			throw new Error('Invoice already processed')
		}

		const account = await this.prismaService.account.upsert({
			where: {
				id: account_id,
			},
			update: {},
			create: {
				id: account_id,
			},
		})

		//const fraudResult = await this.detectFraud({ account, amount })
		const fraudResult = await this.fraudAggregateSpec.detectFraud({
			account,
			amount,
			invoiceId: invoice_id,
		})

		const createdInvoice = await this.prismaService.invoice.create({
			data: {
				accountId: account_id,
				amount: amount,
				fraudHistory: fraudResult.reason
					? {
							create: {
								description: fraudResult.description,
								reason: fraudResult.reason,
							},
						}
					: undefined,
				id: invoice_id,
				status: fraudResult.hasFraud ? InvoiceStatus.REJECTED : InvoiceStatus.APPROVED,
			},
		})

		return {
			fraudResult,
			invoice: createdInvoice,
		}
	}

	/*
	private async detectFraud({ account, amount }: { account: Account; amount: number }): Promise<{
		description?: string
		hasFraud: boolean
		reason?: FraudReason
	}> {
		const INVOICES_HISTORY_COUNT = this.configService.getOrThrow<number>(
			'FRAUD_SERVICE_INVOICES_HISTORY_COUNT'
		)
		const SUSPICIOUS_INVOICES_COUNT = this.configService.getOrThrow<number>(
			'FRAUD_SERVICE_SUSPICIOUS_INVOICES_COUNT'
		)
		const SUSPICIOUS_VARIATION_MAX = this.configService.getOrThrow<number>(
			'FRAUD_SERVICE_SUSPICIOUS_VARIATION_MAX'
		)
		const SUSPICIOUS_TIME_FRAME_HOURS = this.configService.getOrThrow<number>(
			'FRAUD_SERVICE_SUSPICIOUS_TIME_FRAME_HOURS'
		)

		if (account.isSuspicious) {
			return {
				description: 'Account is suspicious',
				hasFraud: true,
				reason: FraudReason.SUSPICIOUS_ACCOUNT,
			}
		}

		const previousInvoices = await this.prismaService.invoice.findMany({
			orderBy: { createdAt: 'desc' },
			where: {
				accountId: account.id,
			},
			take: INVOICES_HISTORY_COUNT,
		})
		if (previousInvoices.length) {
			const totalAmount = previousInvoices.reduce((acc, invoice) => {
				return acc + invoice.amount
			}, 0)

			const averageAmount = totalAmount / previousInvoices.length
			if (amount > averageAmount * SUSPICIOUS_VARIATION_MAX) {
				return {
					description: `Amount ${amount} is too higher than average ${averageAmount}`,
					hasFraud: true,
					reason: FraudReason.UNUSUAL_PATTERN,
				}
			}
		}

		const recentDate = new Date()
		recentDate.setHours(recentDate.getHours() - SUSPICIOUS_TIME_FRAME_HOURS)
		const recentInvoices = await this.prismaService.invoice.findMany({
			where: {
				accountId: account.id,
				createdAt: {
					gte: recentDate,
				},
			},
		})
		if (recentInvoices.length >= SUSPICIOUS_INVOICES_COUNT) {
			return {
				description: `Account ${account.id} has more than 10 invoices in the last 24 hours`,
				hasFraud: true,
				reason: FraudReason.FREQUENT_HIGH_VALUE,
			}
		}

		return {
			hasFraud: false,
		}
	}
	*/
}
