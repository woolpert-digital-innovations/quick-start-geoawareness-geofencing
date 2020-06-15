const repository = require('./repository');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;

/**
 * Intersects event with all geofences belonging to the store and returns
 * an enriched event message. 
 * @param {*} evt 
 */
const doGeofencing = async (evt) => {
    try {
        const store = await repository.getStore(evt.storeName);
        if (!store) {
            throw new Error(`Store ${evt.storeName} not found.`);
        }
        const geofences = await repository.getGeofencesByStore(evt.storeName);
        if (!geofences || !geofences.length) {
            throw new Error(`No geofences found for store ${evt.storeName}.`);
        }
        const processedGeofences = intersectEvent(geofences, evt.eventLocation);
        const innerGeofence = findInnerGeofence(processedGeofences);

        return {
            ...evt,
            innerGeofence: innerGeofence,
            storeLocation: [store.location.longitude, store.location.latitude],
            geofences: processedGeofences
        };
    } catch (error) {
        throw new Error('Error occurred during geofencing.', err);
    }
}

/**
 * Tests the intersection of each geofence with the event and records the result to each geofence. 
 * @param {*} geofences 
 * @param {*} eventPoint 
 */
const intersectEvent = (geofences, eventPoint) => {
    return geofences.map(geofence => {
        return {
            ...geofence,
            intersectsEvent: pointInPolygon(eventPoint, geofence.shape)
        }
    });
}

/**
 * Finds geofence with shortest range from the set of intersecting geofences. 
 * @param {*} geofences 
 */
const findInnerGeofence = (geofences) => {
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
exports.doGeofencing = doGeofencing;