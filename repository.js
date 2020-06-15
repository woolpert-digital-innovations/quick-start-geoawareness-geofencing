const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();

const getStore = async (name) => {
    const storeKey = datastore.key(['Store', name]);
    const query = datastore
        .createQuery('Store')
        .filter('__key__', '=', storeKey);

    const [entities] = await datastore.runQuery(query);
    if (!entities || !entities.length) {
        return null;
    }
    if (entities.length > 1) {
        throw new Error(`More than one store found for ${name}.`);
    }

    const store = {
        name: entities[0].name,
        location: entities[0].location
    }
    return store;
};

const insertStore = (name, store) => {
    return datastore.save({
        key: datastore.key(['Store', name]),
        data: store
    });
};

const deleteStore = (name) => {
    const key = datastore.key(['Store', name]);
    return datastore.delete(key);
}

const insertGeofence = (geofence, storeName) => {
    return datastore.save({
        key: datastore.key(['Store', storeName, 'Geofence']),
        data: geofence
    });
};

const deleteEntities = (keys) => {
    return datastore.delete(keys);
}

const getGeofencesByStore = async (storeName) => {
    const storeKey = datastore.key(['Store', storeName]);
    const query = datastore
        .createQuery('Geofence')
        .order('range')
        .hasAncestor(storeKey);

    const [entities] = await datastore.runQuery(query);
    if (!entities || !entities.length) {
        return [];
    }

    const geofences = entities.map(entity => {
        return {
            range: entity.range,
            rangeType: entity.rangeType,
            // convert GeoJSON string as stored in DataStore to JavaScript object
            shape: JSON.parse(entity.shape)
        }
    })
    return geofences;
};

exports.getStore = getStore;
exports.insertStore = insertStore;
exports.deleteStore = deleteStore;
exports.getGeofencesByStore = getGeofencesByStore;
exports.insertGeofence = insertGeofence;
exports.deleteEntities = deleteEntities;