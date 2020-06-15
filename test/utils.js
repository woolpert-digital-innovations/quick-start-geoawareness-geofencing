const fs = require('fs');

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

const createTimeGeofence = (range, poly) => {
    return {
        range: range,
        rangeType: 'time',
        shape: poly
    };
}

exports.createGeofences = createGeofences;