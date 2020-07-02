const geofencing = require('./geofencing');
const subscriptionName = process.env.INGEST_SUBSCRIPTION_NAME || 'geoawareness-geofencing-service';

const { PubSub } = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

function listenForMessages() {
    const subscription = pubSubClient.subscription(subscriptionName);

    const messageHandler = message => {
        console.log(`\nReceived message ${message.id}:`);
        console.log(`Data: ${message.data}`);
        // console.log(`\tAttributes: ${message.attributes}`);

        const evt = JSON.parse(message.data);
        geofencing.geofenceEvent(evt);

        message.ack();
    };

    // Listen for new messages until timeout is hit
    subscription.on('message', messageHandler);

    // setTimeout(() => {
    //     subscription.removeListener('message', messageHandler);
    //     console.log(`${messageCount} message(s) received.`);
    // }, timeout * 1000);
}

listenForMessages();