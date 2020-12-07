const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
});
const EventEmitter = require('events');
const KafkaView = require('./model/event.js');

class KafkaEventEmitter extends EventEmitter {}
const kafkaEventEmitter = new KafkaEventEmitter();
const kafka = require('./kafka.js')(kafkaEventEmitter);

// Recieve Kafka event from Kafka instance
kafkaEventEmitter.on('kafka events', (topic, event) => {
    io.emit('ws_kafka_event', KafkaView.jsonViewFromKafkaEvent(event));
});

io.on('connection', (socket) => {
    console.log('Websocket connected');
    
    socket.on('ws_list_kafka_topic', () => {
        let topics = kafka.listTopics();
        for (topic of topics) {
            socket.emit('ws_kafka_topic', topic);
        }
    });

    socket.on('ws_get_kafka_events', (topic) => {
        let events = kafka.getEvents(topic);
        console.log(`get events - Cached topic: ${topic}, number of event: ${events.length}`);
        events.forEach(event => {
            socket.emit('ws_kafka_event', KafkaView.jsonViewFromKafkaEvent(event));
        });
    });

    socket.on('ws_produce_kafka_event', (topic, event) => {
        console.log(`receive event from GUI - ${topic}:${event}`);
        kafka.publishEvent(topic, event);
    });
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/topics.html');
});

app.get('/details', (req, res) => {
    res.sendFile(__dirname + '/html/details.html');
});

http.listen(4001, () => {
  console.log('listening on *:4001');
});
