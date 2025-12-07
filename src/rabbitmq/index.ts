import * as amqplib from 'amqplib';

class RabbitMQ {
    private connection: amqplib.ChannelModel;
    private channel: amqplib.Channel;

    constructor() {
        this.connection = null as any;
        this.channel = null as any;
    }
    async connectRabbitMQ(url: string, consumerMap?: [{ queueName: string, handler: (data: any) => Promise<void>, type: 'pubsub' | 'queue' }]) {
        if (this.connection) return this.channel; // Avoid reconnecting

        this.connection = await amqplib.connect(url);
        this.channel = await this.connection.createChannel();

        console.log("RabbitMQ connected");

        if (!consumerMap) return this.channel;
        for( let i = 0; i < consumerMap.length; i++ ) {
            const { queueName, handler, type } = consumerMap[i];
            if (type == 'pubsub') {
                await this.subscribeFanout(queueName, handler);
                continue;
            }
            await this.consume(queueName, handler);
        }
        return this.channel;
    }

    async publish(queue: string, message: Record<string, any>) {
        if (!this.channel) throw new Error("RabbitMQ not initialized.");
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)),
            {
                type: 'fanout',
            });
    }

    async consume(queue: string, handler: any) {
        if (!this.channel) throw new Error("RabbitMQ not initialized.");
        await this.channel.assertQueue(queue, { durable: true });

        this.channel.consume(queue, async (msg: amqplib.ConsumeMessage | null) => {
            const data = JSON.parse(msg!.content.toString());
            try {
                await handler(data);
                this.channel.ack(msg!);
            } catch (err) {
                console.error("Error handling message:", err);
                // optional: channel.nack(msg, false, true);
            }
        });
    }

    async publishFanout(exchange: string, message: any) {
        if (!this.channel) throw new Error("RabbitMQ not initialized.");

        await this.channel.assertExchange(exchange, "fanout", { durable: false });

        this.channel.publish(
            exchange,
            "",
            Buffer.from(JSON.stringify(message))
        );

        console.log(`[Fanout] Sent to exchange "${exchange}"`, message);
    }

    /** Subscribe to fanout broadcast */
    async subscribeFanout(
        exchange: string,
        handler: (data: any) => Promise<void>
    ) {
        if (!this.channel) throw new Error("RabbitMQ not initialized.");

        await this.channel.assertExchange(exchange, "fanout", { durable: false });

        // auto-generated, private queue
        const q = await this.channel.assertQueue("", { exclusive: true });

        await this.channel.bindQueue(q.queue, exchange, "");

        console.log(`[Fanout] Listening on "${exchange}" queue: ${q.queue}`);

        this.channel.consume(
            q.queue,
            async (msg) => {
                if (!msg) return;
                const data = JSON.parse(msg.content.toString());
                await handler(data);
            },
            { noAck: true }
        );
    }
}

export default new RabbitMQ();
