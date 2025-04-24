import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { ConfluentKafkaServer } from '../kafka/confluent-kafka-server'
import { Logger } from '@nestjs/common'

export async function kafkaBootstrap() {
	const logger = new Logger(ConfluentKafkaServer.name)
	const app = await NestFactory.createMicroservice(AppModule, {
		strategy: new ConfluentKafkaServer({
			server: {
				'bootstrap.servers': process.env.KAFKA_BOOTSTRAP_SERVERS!,
			},
			consumer: {
				allowAutoTopicCreation: true,
				sessionTimeout: 10000,
				rebalanceTimeout: 10000,
			},
		}),
	})
	logger.log('Kafka microservice is running')
	await app.listen()
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
kafkaBootstrap()
