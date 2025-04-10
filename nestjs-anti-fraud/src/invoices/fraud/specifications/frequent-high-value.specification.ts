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
export class FrequentHighValueSpecification implements IFraudSpecification {
	constructor(
		private prisma: PrismaService,
		private configService: ConfigService
	) {}

	async detectFraud({ account }: FraudSpecificationContext): Promise<FraudDetectionResult> {
		const SUSPICIOUS_INVOICES_COUNT = this.configService.getOrThrow<number>(
			'FRAUD_SERVICE_SUSPICIOUS_INVOICES_COUNT'
		)
		const SUSPICIOUS_TIME_FRAME_HOURS = this.configService.getOrThrow<number>(
			'FRAUD_SERVICE_SUSPICIOUS_TIME_FRAME_HOURS'
		)

		const recentDate = new Date()
		recentDate.setHours(recentDate.getHours() - SUSPICIOUS_TIME_FRAME_HOURS)

		const recentInvoices = await this.prisma.invoice.findMany({
			where: {
				accountId: account.id,
				createdAt: { gte: recentDate },
			},
		})

		if (recentInvoices.length >= SUSPICIOUS_INVOICES_COUNT) {
			// Mark account as suspicious
			await this.prisma.account.update({
				where: { id: account.id },
				data: { isSuspicious: true },
			})

			return {
				hasFraud: true,
				reason: FraudReason.FREQUENT_HIGH_VALUE,
				description: `${recentInvoices.length} high-value invoices in the last ${SUSPICIOUS_TIME_FRAME_HOURS} hours`,
			}
		}

		return { hasFraud: false }
	}
}
