const test = require('ava');
const geofencing = require('../geofencing');
const fs = require('fs');
const utils = require('./utils');

let poly120, geofence120;
let poly300, geofence300;

test.before(t => {
    const rawPoly120 = fs.readFileSync('test/time_120_poly.json', 'utf8');
    poly120 = JSON.parse(rawPoly120);
    geofence120 = {
        range: 120,
        rangeType: 'time',
        shape: poly120
    };

    const rawPoly300 = fs.readFileSync('test/time_300_poly.json', 'utf8');
    poly300 = JSON.parse(rawPoly300);
    geofence300 = {
        range: 300,
        rangeType: 'time',
        shape: poly300
    };
});

test('pointInPolygon point inside polygon', t => {
    const pt = [-93.220024, 36.650717];
    const isPointInPolygon = geofencing.pointInPolygon(pt, poly300);
    t.assert(isPointInPolygon);
});

test('pointInPolygon point outside polygon', t => {
    const pt = [93.220024, 36.650717];
    const isPointInPolygon = geofencing.pointInPolygon(pt, poly300);
    t.false(isPointInPolygon);
});

test('intersectEvent event inside all geofences', t => {
    const eventPoint = [-93.220024, 36.650717];
    const geofences = geofencing.intersectEvent([geofence120, geofence300], eventPoint);
    t.assert(geofences.every(geofence => geofence.intersectsEvent));
});

test('findInnerGeofence event in inner geofence', t => {
    const eventPoint = [-93.220024, 36.650717];
    const geofences = geofencing.intersectEvent([geofence120, geofence300], eventPoint);
    const innerGeofence = geofencing.findInnerGeofence(geofences);
    t.is(innerGeofence, geofences[0]);
});

test('findInnerGeofence event in outer geofence', t => {
    const eventPoint = [-93.218270, 36.622237];
    const geofences = geofencing.intersectEvent([geofence120, geofence300], eventPoint);
    const innerGeofence = geofencing.findInnerGeofence(geofences);
    t.is(innerGeofence, geofences[1]);
});

test('findInnerGeofence event outside any geofence', t => {
    const eventPoint = [93.218270, 36.622237];
    const geofences = geofencing.intersectEvent([geofence120, geofence300], eventPoint);
    const innerGeofence = geofencing.findInnerGeofence(geofences);
    t.is(innerGeofence, undefined);
});

test('doGeofencing point in INNER geofence', async t => {
    const evt = {
        orderId: 76890291998,
        eventLocation: [-93.220024, 36.650717],
        eventTimestamp: new Date(),
        storeName: 'carmelit',
    };

    const geofencedEvent = await geofencing.doGeofencing(evt);

    const geofences = utils.createGeofences()
        .sort((first, second) => first.range - second.range);
    geofences.forEach(geofence => {
        geofence.intersectsEvent = true
    });

    const expected = {
        ...evt,
        storeLocation: [-93.220024, 36.650717],
        innerGeofence: geofences[0],
        geofences: geofences
    }
    t.deepEqual(geofencedEvent, expected);
});

test('doGeofencing point in MIDDLE geofence', async t => {
    const evt = {
        orderId: 76890291998,
        eventLocation: [-93.24011, 36.65083],
        eventTimestamp: new Date(),
        storeName: 'carmelit',
    };

    const geofencedEvent = await geofencing.doGeofencing(evt);

    const geofences = utils.createGeofences()
        .sort((first, second) => first.range - second.range);
    geofences[0].intersectsEvent = false;
    geofences[1].intersectsEvent = true;
    geofences[2].intersectsEvent = true;

    const expected = {
        ...evt,
        storeLocation: [-93.220024, 36.650717],
        innerGeofence: geofences[1],
        geofences: geofences
    }
    t.deepEqual(geofencedEvent, expected);
});