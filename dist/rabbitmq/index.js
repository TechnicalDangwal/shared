import * as amqplib from 'amqplib';
class RabbitMQ {
    constructor() {
        this.connection = null;
        this.channel = null;
    }
    async connectRabbitMQ(url, consumerMap) {
        if (this.connection)
            return this.channel; // Avoid reconnecting
        this.connection = await amqplib.connect(url);
        this.channel = await this.connection.createChannel();
        console.log("RabbitMQ connected");
        if (!consumerMap)
            return this.channel;
        for (let i = 0; i < consumerMap.length; i++) {
            const { queueName, handler, type } = consumerMap[i];
            if (type == 'pubsub') {
                await this.subscribeFanout(queueName, handler);
                continue;
            }
            await this.consume(queueName, handler);
        }
        return this.channel;
    }
    async publish(queue, message) {
        if (!this.channel)
            throw new Error("RabbitMQ not initialized.");
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            type: 'fanout',
        });
    }
    async consume(queue, handler) {
        if (!this.channel)
            throw new Error("RabbitMQ not initialized.");
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.consume(queue, async (msg) => {
            const data = JSON.parse(msg.content.toString());
            try {
                await handler(data);
                this.channel.ack(msg);
            }
            catch (err) {
                console.error("Error handling message:", err);
                // optional: channel.nack(msg, false, true);
            }
        });
    }
    async publishFanout(exchange, message) {
        if (!this.channel)
            throw new Error("RabbitMQ not initialized.");
        await this.channel.assertExchange(exchange, "fanout", { durable: false });
        this.channel.publish(exchange, "", Buffer.from(JSON.stringify(message)));
        console.log(`[Fanout] Sent to exchange "${exchange}"`, message);
    }
    /** Subscribe to fanout broadcast */
    async subscribeFanout(exchange, handler) {
        if (!this.channel)
            throw new Error("RabbitMQ not initialized.");
        await this.channel.assertExchange(exchange, "fanout", { durable: false });
        // auto-generated, private queue
        const q = await this.channel.assertQueue("", { exclusive: true });
        await this.channel.bindQueue(q.queue, exchange, "");
        console.log(`[Fanout] Listening on "${exchange}" queue: ${q.queue}`);
        this.channel.consume(q.queue, async (msg) => {
            if (!msg)
                return;
            const data = JSON.parse(msg.content.toString());
            await handler(data);
        }, { noAck: true });
    }
}
export default new RabbitMQ();
