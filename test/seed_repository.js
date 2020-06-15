const repository = require('../repository');
const { Datastore } = require('@google-cloud/datastore');
const fs = require('fs');

const datastore = new Datastore();

const createTimeGeofence = (range, poly) => {
    return {
        range: range,
        rangeType: 'time',
        shape: poly
    };
}

const createGeofences = () => {
    const geofences = [];

    let rawPoly = fs.readFileSync('test/time_120_poly.json', 'utf8');
    let poly = JSON.parse(rawPoly);
    let geofence = createTimeGeofence(120, poly);
    geofences.push(geofence);

    rawPoly = fs.readFileSync('test/time_300_poly.json', 'utf8');
    poly = JSON.parse(rawPoly);
    geofence = createTimeGeofence(300, poly);
    geofences.push(geofence);

    rawPoly = fs.readFileSync('test/time_600_poly.json', 'utf8');
    poly = JSON.parse(rawPoly);
    geofence = createTimeGeofence(600, poly);
    geofences.push(geofence);

    return geofences;
}

const seedStore = async () => {
    await repository.deleteStore('carmelit');
    await repository.insertStore('carmelit',
        {
            name: 'carmelit',
            location: datastore.geoPoint({
                longitude: -93.220024,
                latitude: 36.650717
            })
        });
}

const createTimeGeofenceEntity = (range, poly) => {
    return [
        ...createGeofenceEntity(range, poly),
        {
            name: 'rangeType',
            value: 'time'
        }
    ];
}

const createDistanceGeofenceEntity = (range, poly) => {
    return [
        ...createGeofenceEntity(range, poly),
        {
            name: 'rangeType',
            value: 'distance'
        }
    ];
}

const createGeofenceEntity = (range, poly) => {
    return [
        {
            name: 'range',
            value: range
        },
        {
            name: 'shape',
            value: poly,
            type: 'string',
            excludeFromIndexes: true
        }
    ];

}

const createGeofenceEntities = () => {
    const geofences = [];

    let poly = fs.readFileSync('test/time_120_poly.json', 'utf8');
    let geofence = createTimeGeofenceEntity(120, poly);
    geofences.push(geofence);

    poly = fs.readFileSync('test/time_300_poly.json', 'utf8');
    geofence = createTimeGeofenceEntity(300, poly);
    geofences.push(geofence);

    poly = fs.readFileSync('test/time_600_poly.json', 'utf8');
    geofence = createTimeGeofenceEntity(600, poly);
    geofences.push(geofence);

    return geofences;
}

const seedGeofences = async () => {
    let geofences = [];
    try {
        geofences = await repository.getGeofencesByStore('carmelit');
        if (geofences && geofences.length) {
            repository.deleteEntities(geofences.map(geofence => geofence[datastore.KEY]));
        }
        const seedGeofences = createGeofenceEntities();
        for (var i = 0; i < seedGeofences.length; i++) {
            await repository.insertGeofence(seedGeofences[i], 'carmelit');
        }
        // TODO: revisit distance-based geofence at a later time
        // poly = fs.readFileSync('test/distance_30_poly.json', 'utf8');
        // geofence = createDistanceGeofence(30, poly);
        // await repository.insertGeofence(geofence, 'carmelit');
    } catch (error) {
        console.log(error);
    }
}

exports.createGeofences = createGeofences;
exports.createGeofenceEntities = createGeofenceEntities;
exports.seedStore = seedStore;
exports.seedGeofences = seedGeofences;