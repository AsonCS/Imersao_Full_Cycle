import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import {
	IFraudSpecification,
	FraudSpecificationContext,
	FraudDetectionResult,
} from './fraud-specification.interface'
import { FraudReason } from 'generated/prisma'

@Injectable()
export class UnusualAmountSpecification implements IFraudSpecification {
	constructor(
		private prisma: PrismaService,
		private configService: ConfigService
	) {}

	async detectFraud({
		account,
		amount,
	}: FraudSpecificationContext): Promise<FraudDetectionResult> {
		const SUSPICIOUS_VARIATION_MAX = this.configService.getOrThrow<number>(
			'FRAUD_SERVICE_SUSPICIOUS_VARIATION_MAX'
		)
		const INVOICES_HISTORY_COUNT = this.configService.getOrThrow<number>(
			'FRAUD_SERVICE_INVOICES_HISTORY_COUNT'
		)

		const previousInvoices = await this.prisma.invoice.findMany({
			orderBy: { createdAt: 'desc' },
			where: { accountId: account.id },
			take: INVOICES_HISTORY_COUNT,
		})

		if (previousInvoices.length > 0) {
			const totalAmount = previousInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
			const averageAmount = totalAmount / previousInvoices.length

			if (amount > averageAmount * SUSPICIOUS_VARIATION_MAX) {
				return {
					hasFraud: true,
					reason: FraudReason.UNUSUAL_PATTERN,
					description: `Amount ${amount} is ${((amount / averageAmount) * 100 - 100).toFixed(2)}% higher than account average of ${averageAmount.toFixed(2)}`,
				}
			}
		}

		return { hasFraud: false }
	}
}
