const geofencing = require('./geofencing');

const evt = {
    // orderId: '12345',
    orderId: '135656168751104',
    eventLocation: {
        longitude: -93.24011,
        latitude: 36.65083
    },
    eventTimestamp: 1593563187,
    storeName: 'carmelit'
};

geofencing.geofenceEvent(evt);