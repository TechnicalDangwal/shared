import * as amqplib from 'amqplib';
declare class RabbitMQ {
    private connection;
    private channel;
    constructor();
    connectRabbitMQ(url: string, consumerMap?: {
        [key: string]: (data: any) => Promise<void>;
    }): Promise<amqplib.Channel>;
    publish(queue: string, message: Record<string, any>): Promise<void>;
    consume(queue: string, handler: any): Promise<void>;
    publishFanout(exchange: string, message: any): Promise<void>;
    /** Subscribe to fanout broadcast */
    subscribeFanout(exchange: string, handler: (data: any) => Promise<void>): Promise<void>;
}
declare const _default: RabbitMQ;
export default _default;
