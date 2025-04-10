import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { InvoicesModule } from './invoices/invoices.module'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				DATABASE_URL: Joi.string().uri().required(),
				FRAUD_SERVICE_INVOICES_HISTORY_COUNT: Joi.number(),
				FRAUD_SERVICE_SUSPICIOUS_INVOICES_COUNT: Joi.number(),
				FRAUD_SERVICE_SUSPICIOUS_VARIATION_MAX: Joi.number(),
				FRAUD_SERVICE_SUSPICIOUS_TIME_FRAME_HOURS: Joi.number(),
			}),
		}),
		InvoicesModule,
		PrismaModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
