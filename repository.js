const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();

const getStore = async storeName => {
    const storeKey = datastore.key(['Store', storeName.toLowerCase()]);

    const [entity] = await datastore.get(storeKey);
    if (!entity) {
        return null;
    }
    return toStoreObject(entity);
};

const toStoreObject = entity => {
    return {
        name: entity.name,
        location: entity.location,
        address: entity.address
    };
}

const toStoreEntity = store => {
    return [
        {
            name: 'name',
            value: store.name
        },
        {
            name: 'location',
            value: datastore.geoPoint(store.location),
            type: 'geoPoint',
            excludeFromIndexes: true
        },
        {
            name: 'address',
            value: store.address,
            excludeFromIndexes: true
        }
    ];
}
const insertStore = async store => {
    return await datastore.save({
        key: datastore.key(['Store', store.name.toLowerCase()]),
        data: toStoreEntity(store)
    });
};

const deleteStore = async storeName => {
    const key = datastore.key(['Store', storeName.toLowerCase()]);
    return await datastore.delete(key);
}

const insertGeofence = async (geofence, storeName) => {
    return await datastore.save({
        key: datastore.key(['Store', storeName.toLowerCase(), 'Geofence']),
        data: toGeofenceEntity(geofence)
    });
};

const insertGeofences = async (geofences, storeName) => {
    const entities = geofences.map(geofence => {
        return {
            key: datastore.key(['Store', storeName.toLowerCase(), 'Geofence']),
            data: toGeofenceEntity(geofence)
        };
    });
    return await datastore.save(entities);
};

const deleteGeofence = async (geofenceId, storeName) => {
    const key = datastore.key(['Store', storeName.toLowerCase(), 'Geofence', parseInt(geofenceId)]);
    return await datastore.delete(key);
}

const deleteGeofences = async (geofenceIds, storeName) => {
    const keys = geofenceIds.map(id => {
        return datastore.key(['Store', storeName.toLowerCase(), 'Geofence', parseInt(id)]);
    });
    return await datastore.delete(keys);
}

const getGeofencesByStore = async storeName => {
    const storeKey = datastore.key(['Store', storeName.toLowerCase()]);
    const query = datastore
        .createQuery('Geofence')
        .order('range')
        .hasAncestor(storeKey);

    const [entities] = await datastore.runQuery(query);
    if (!entities || !entities.length) {
        return [];
    }
    return entities.map(entity => toGeofenceObject(entity));
};

const toGeofenceEntity = geofence => {
    return [
        {
            name: 'rangeType',
            value: geofence.rangeType
        },
        {
            name: 'range',
            value: geofence.range
        },
        {
            name: 'shape',
            // convert GeoJSON string as stored in DataStore to JavaScript object
            value: JSON.stringify(geofence.shape),
            type: 'string',
            excludeFromIndexes: true
        }
    ];
}

const toGeofenceObject = entity => {
    return {
        id: entity[datastore.KEY].id,
        range: entity.range,
        rangeType: entity.rangeType,
        // convert GeoJSON string as stored in DataStore to JavaScript object
        shape: JSON.parse(entity.shape)
    }
}

const getOrdersByStore = async storeName => {
    const storeKey = datastore.key(['Store', storeName.toLowerCase()]);
    const query = datastore
        .createQuery('Order')
        .hasAncestor(storeKey);

    const [entities] = await datastore.runQuery(query);
    if (!entities || !entities.length) {
        return [];
    }
    return entities.map(entity => toOrderObject(entity));
};

const getOrder = async (orderId, storeName) => {
    const key = datastore.key(['Store', storeName.toLowerCase(), 'Order', orderId]);

    const [entity] = await datastore.get(key);
    if (!entity) {
        return null;
    }
    return toOrderObject(entity);
};

const toOrderObject = entity => {
    const order = {
        orderId: entity.orderId,
        storeName: entity.storeName,
        status: entity.status
    };
    if (entity.latestEvent) {
        const latestEvent = entity.latestEvent;
        order.latestEvent = {
            eventLocation: latestEvent.eventLocation,
            eventTimestamp: latestEvent.eventTimestamp,
            innerGeofence: latestEvent.innerGeofence,
            geofences: latestEvent.geofences
        }
    }
    return order;
}

const toOrderEntity = order => {
    const props = [
        {
            name: 'orderId',
            value: order.orderId
        },
        {
            name: 'storeName',
            value: order.storeName,
            excludeFromIndexes: true
        },
        {
            name: 'status',
            value: order.status
        },
    ];
    if (order.latestEvent) {
        const eventLocation = order.latestEvent.eventLocation;
        props.push({
            name: 'latestEvent',
            value: {
                ...order.latestEvent,
                eventLocation: datastore.geoPoint({
                    longitude: eventLocation.longitude,
                    latitude: eventLocation.latitude
                })
            },
            type: 'object',
            excludeFromIndexes: true
        })
    };
    return props;
}

const saveOrder = async order => {
    return await datastore.save({
        key: datastore.key(['Store', order.storeName.toLowerCase(), 'Order', order.orderId]),
        data: toOrderEntity(order)
    });
};

const deleteOrder = async (orderId, storeName) => {
    const key = datastore.key(['Store', storeName.toLowerCase(), 'Order', orderId]);
    return await datastore.delete(key);
}

const deleteOrders = async (orderIds, storeName) => {
    const keys = orderIds.map(orderId => {
        return datastore.key(['Store', storeName.toLowerCase(), 'Order', orderId]);
    });
    return await datastore.delete(keys);
}

const insertEvent = async evt => {
    return await datastore.save({
        key: datastore.key(['Store', evt.storeName.toLowerCase(), 'Order', evt.orderId, 'Event']),
        data: toEventEntity(evt)
    });
};

const toEventEntity = evt => {
    return [
        {
            name: 'orderId',
            value: evt.orderId,
            excludeFromIndexes: true
        },
        {
            name: 'eventTimestamp',
            value: evt.eventTimestamp,
            excludeFromIndexes: true
        },
        {
            name: 'eventLocation',
            value: datastore.geoPoint({
                longitude: evt.eventLocation.longitude,
                latitude: evt.eventLocation.latitude
            }),
            excludeFromIndexes: true
        }
    ];
}

exports.getStore = getStore;
exports.insertStore = insertStore;
exports.deleteStore = deleteStore;

exports.getGeofencesByStore = getGeofencesByStore;
exports.insertGeofence = insertGeofence;
exports.insertGeofences = insertGeofences;
exports.deleteGeofence = deleteGeofence;
exports.deleteGeofences = deleteGeofences;

exports.getOrdersByStore = getOrdersByStore;
exports.getOrder = getOrder;
exports.saveOrder = saveOrder;
exports.deleteOrder = deleteOrder;
exports.deleteOrders = deleteOrders;

exports.insertEvent = insertEvent;