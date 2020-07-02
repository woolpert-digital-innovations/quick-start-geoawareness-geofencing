const repository = require('./repository');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;

/**
 * Intersects event with all geofences belonging to the store and upserts order document.
 * @param {*} evt 
 */
const geofenceEvent = async evt => {
    try {
        // TODO: wrap in a transaction
        const geofencingPromise = new Promise((resolve, reject) => {
            resolve(doGeofencing(evt));
        });
        const orderPromise = new Promise((resolve, reject) => {
            resolve(repository.getOrder(evt.orderId, evt.storeName).then(order => {
                return order || {
                    orderId: evt.orderId,
                    status: ['open'],
                    storeName: evt.storeName
                };
            }));
        });

        const [{ innerGeofence, processedGeofences }, order] = await Promise.all([geofencingPromise, orderPromise]);
        order.latestEvent = {
            eventLocation: evt.eventLocation,
            eventTimestamp: evt.eventTimestamp,
            innerGeofence: innerGeofence,
            geofences: processedGeofences
        };

        await repository.saveOrder(order);
        repository.insertEvent(evt);

    } catch (error) {
        console.log(error);
        throw new Error('Error occurred during geofencing.', error);
    }
}

const doGeofencing = async evt => {
    const store = await repository.getStore(evt.storeName);
    if (!store) {
        throw new Error(`Store ${evt.storeName} not found.`);
    }
    const geofences = await repository.getGeofencesByStore(store.name);
    if (!geofences || !geofences.length) {
        throw new Error(`No geofences found for store ${store.name}.`);
    }

    const pt = [evt.eventLocation.longitude, evt.eventLocation.latitude];
    const processedGeofences = intersectEvent(geofences, pt);
    const innerGeofence = findInnerGeofence(processedGeofences);

    // remove fields: 
    //   1) avoid duplicating geofence geometry for each order 
    //   2) geofence id should be hidden
    processedGeofences.forEach(geofence => {
        delete geofence.shape;
        delete geofence.id;
    });
    delete innerGeofence.shape;
    delete innerGeofence.id;

    return { innerGeofence, processedGeofences };
}

/**
 * Tests the intersection of each geofence with the event and writes the result to each geofence. 
 * @param {*} geofences 
 * @param {*} pt 
 */
const intersectEvent = (geofences, pt) => {
    return geofences.map(geofence => {
        return {
            ...geofence,
            intersectsEvent: pointInPolygon(pt, geofence.shape)
        }
    });
}

/**
 * Finds geofence with shortest range from the set of intersecting geofences. 
 * @param {*} geofences 
 */
const findInnerGeofence = geofences => {
    const intersectingGeofences = geofences
        .filter(geofence => geofence.intersectsEvent)
        .sort((first, second) => first.range - second.range);

    return intersectingGeofences[0];
}

const pointInPolygon = (pt, poly) => {
    return booleanPointInPolygon(pt, poly);
}

exports.findInnerGeofence = findInnerGeofence;
exports.intersectEvent = intersectEvent;
exports.pointInPolygon = pointInPolygon;
exports.geofenceEvent = geofenceEvent;