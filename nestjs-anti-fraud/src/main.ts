import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { kafkaBootstrap } from './cmd/kafka.cmd'
import { Logger } from '@nestjs/common'

const logger = new Logger('nestjs')

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	await app.listen(process.env.PORT!)
}

logger.log('Init Server')
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()

logger.log('Init Kafka Microservice')
// eslint-disable-next-line @typescript-eslint/no-floating-promises
kafkaBootstrap()
