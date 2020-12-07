const kafka = require('kafka-node');
const { getConsumeTopics } = require('./config.js');
const topics = getConsumeTopics();

const config = {
    kafkaHost: 'localhost:9092',
    groupId: 'ExampleTestGroup',
    sessionTimeout: 15000,
    protocol: ['roundrobin'],
    fromOffset: 'earliest' // equivalent of auto.offset.reset valid values are 'none', 'latest', 'earliest'
};

module.exports = (eventEmitter) => {

    let consumer = new KafkaConsumer(eventEmitter);
    let producer = new KafkaProducer();

    return {
        listTopics: () => consumer.listTopics(),
        getEvents: (topic) => consumer.getEvents(topic),
        publishEvent: (topic, event) => producer.publishEvent(topic, event),
    }
}

class KafkaConsumer {
    
    constructor(eventEmitter) {
        // Received events will be stored in this object
        // key = topic, value = event body 
        this.eventStore = {};
        this.eventEmitter = eventEmitter;

        let client = new kafka.KafkaClient(config);
        let offset = new kafka.Offset(client);
        offset.fetchLatestOffsets(topics.topics, (error, offsets) => {
            if (error) return handleError(error);
            console.log(offsets);
        });

        this.consumer = new kafka.ConsumerGroup(Object.assign({ id: 'consumer1' }, config), topics.topics);
        this.consumer.on('message', (message) => this.onRecieveEvent(message, this));
    }
    

    onRecieveEvent(message, that) {
        let topic = message.topic;
        console.log(`Receive event from Kafka - ${topic}: ${message.value.toString()}`);
        if (!that.eventStore.hasOwnProperty(topic)) {
            that.eventStore[topic] = [];
        }

        // Cache the new event in memory
        that.eventStore[topic].push(message);
        
        // Push this new event to websocket
        that.eventEmitter.emit('kafka events', topic, message); 
    }

    listTopics() {
        return topics.topics;
    } 

    getEvents(topic) {
        if (!this.eventStore.hasOwnProperty(topic)) {
            return [];
        }
        return this.eventStore[topic];
    }
}

class KafkaProducer {

    constructor() {
        let client = new kafka.KafkaClient(config);
        this.producer = new kafka.HighLevelProducer(client);
        
        // this.producer.on('ready', () => setInterval(this.publishEvent, 1000));
        this.producer.on('error', (err) => console.log('error', err));
    }

    publishEvent(topic, event) {
        this.producer.send([{ topic: topic, messages: [event] }], (err, data) => {
            if (err) console.log(err);
        });
    }
}
