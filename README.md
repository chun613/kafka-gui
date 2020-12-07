# kafka-gui (Under development)
User interface for sending and reading Kafka events.

The idea is to have a nodeJS server that listens to Kafka, cache the event to memory, and stream the event to UI via socketio.  

The UI will be written in ReactJS, which serves 3 purposes.  
- List the number topic available 
- Read the event of particular topic that is cached in server
- Publish event

## TODO
- User interface 
- Docker-compose for setting up Kafka and Zookeeper
