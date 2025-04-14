import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { kafkaBootstrap } from './cmd/kafka.cmd'
import { Logger } from '@nestjs/common'
//import * as kafkaLib from '@confluentinc/kafka-javascript'

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
/*;(async () => {
	const host = 'localhost:29092,localhost:9092'
	const producer = new kafkaLib.KafkaJS.Kafka({
		'bootstrap.servers': host,
		'metadata.broker.list': host,
	}).producer({
		'bootstrap.servers': host,
		'metadata.broker.list': host,
	})

	await producer.connect()
	console.log('Connected successfully')

	const res: any[] = []
	for (let i = 0; i < 50; i++) {
		res.push(
			producer.send({
				topic: 'test-topic',
				messages: [{ value: 'v', partition: 0, key: 'x' }],
			})
		)
	}
	await Promise.all(res)

	await producer.disconnect()
	console.log('Disconnected successfully')
})()
*/
