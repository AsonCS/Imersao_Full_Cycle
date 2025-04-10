import { Injectable } from '@nestjs/common'
import {
	IFraudSpecification,
	FraudSpecificationContext,
	FraudDetectionResult,
} from './fraud-specification.interface'
import { FraudReason } from 'generated/prisma'

@Injectable()
export class SuspiciousAccountSpecification implements IFraudSpecification {
	detectFraud({ account }: FraudSpecificationContext): FraudDetectionResult {
		if (account.isSuspicious) {
			return {
				hasFraud: true,
				reason: FraudReason.SUSPICIOUS_ACCOUNT,
				description: 'Account is flagged as suspicious',
			}
		}

		return { hasFraud: false }
	}
}
