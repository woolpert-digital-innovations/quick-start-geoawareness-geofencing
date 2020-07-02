const repository = require('../repository');
const { Datastore } = require('@google-cloud/datastore');
const utils = require('./test_utils');

const seedStore = async () => {
    await repository.deleteStore('carmelit');
    await repository.insertStore(utils.createStore('Carmelit'));
}

const seedGeofences = async () => {
    let geofences = [];
    try {
        geofences = await repository.getGeofencesByStore('carmelit');
        if (geofences && geofences.length) {
            for (var i = 0; i < geofences.length; i++) {
                const resp = await repository.deleteGeofence(geofences[i].id, 'carmelit');
            }
        }
        const seedGeofences = utils.createGeofences();
        for (var i = 0; i < seedGeofences.length; i++) {
            await repository.insertGeofence(seedGeofences[i], 'carmelit');
        }
    } catch (error) {
        console.log(error);
    }
}

const seedOrders = async () => {
    let orders = [];
    try {
        orders = await repository.getOrdersByStore('carmelit');
        if (orders && orders.length) {
            for (var i = 0; i < orders.length; i++) {
                const resp = await repository.deleteOrder(orders[i].orderId, 'carmelit');
            }
        }
        const seedOrders = utils.createOrders('carmelit');
        for (var i = 0; i < seedOrders.length; i++) {
            await repository.saveOrder(seedOrders[i]);
        }
    } catch (error) {
        console.log(error);
    }
}

seedStore();
seedGeofences();
seedOrders();