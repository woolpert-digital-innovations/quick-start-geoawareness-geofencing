const repository = require('../repository');
const utils = require('./test_utils');

const storeName = 'carmelit';
const seedStore = async () => {
    await repository.deleteStore(storeName);
    const store = {
        name: 'Carmelit',
        location: {
            longitude: -93.220024,
            latitude: 36.650717
        },
        address: '504 Veterans Blvd, Branson, MO 65616'
    }
    await repository.insertStore(store);
}

const seedGeofences = async () => {
    let geofences = [];
    try {
        geofences = await repository.getGeofencesByStore(storeName);
        if (geofences && geofences.length) {
            await repository.deleteGeofences(geofences.map(geofence => geofence.id), storeName);
        }
        const seedGeofences = utils.createGeofences();
        await repository.insertGeofences(seedGeofences, storeName);
    } catch (error) {
        console.log(error);
    }
}

const seedOrders = async () => {
    let orders = [];
    try {
        orders = await repository.getOrdersByStore(storeName);
        if (orders && orders.length) {
            await repository.deleteOrders(orders.map(order => order.orderId), storeName);
        }
        const seedOrders = utils.createOrders(storeName);
        await repository.saveOrders(seedOrders);
    } catch (error) {
        console.log(error);
    }
}

seedStore();
seedGeofences();
seedOrders();