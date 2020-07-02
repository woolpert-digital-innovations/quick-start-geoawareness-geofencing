const geofencing = require('./geofencing');

const evt = {
    orderId: 'Re6lXdbGMY',
    eventLocation: {
        longitude: -93.24011,
        latitude: 36.65083
    },
    eventTimestamp: parseInt(Date.now() / 1000),
    storeName: 'carmelit'
};

geofencing.geofenceEvent(evt);