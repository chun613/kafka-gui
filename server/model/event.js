module.exports = class KafkaView {
    constructor(topic, body, header, key, partition, offset, timestamp) {
        this.topic = topic;
        this.body = body;
        this.header = header;
        this.key = key;
        this.partition = partition;
        this.offset = offset;
        this.timestamp = timestamp;
    }

    static jsonViewFromKafkaEvent(body) {
        let date = new Date(body.timestamp);
        return JSON.stringify(
            new KafkaView(body.topic, 
                body.value.toString(),
                body.header, 
                body.key,
                body.partition,
                body.offset,
                date));
    }
}
