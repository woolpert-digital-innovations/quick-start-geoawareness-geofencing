const test = require('ava');
const geofencing = require('../geofencing');
const repository = require('../repository');
const utils = require('./test_utils');
const chance = require('chance').Chance();
const fs = require('fs');

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

test('geofenceEvent point in MIDDLE geofence NEW order', async t => {
    const storeName = chance.word();
    let store = utils.createStore(storeName);
    await repository.insertStore(store);

    let geofences = utils.createGeofences();
    await repository.insertGeofences(geofences, storeName);

    const orderId = chance.integer();
    const evt = utils.createEvent(storeName, orderId);
    await geofencing.geofenceEvent(evt);

    const latestEvent = utils.createLatestEvent();
    latestEvent.geofences.sort((first, second) => first.range - second.range);
    latestEvent.geofences[0].intersectsEvent = false; // inner
    latestEvent.geofences[1].intersectsEvent = true; // middle
    latestEvent.geofences[2].intersectsEvent = true; //outer
    latestEvent.innerGeofence = latestEvent.geofences[1];
    const expected = {
        orderId: orderId,
        storeName: storeName,
        status: ['new'],
        latestEvent: latestEvent
    }

    const orders = await repository.getOrdersByStore(storeName);
    t.deepEqual(orders[0], expected);

    await repository.deleteOrder(expected.orderId, storeName);
    geofences = await repository.getGeofencesByStore(storeName);
    const geofenceIds = geofences.map(geofence => geofence.id);
    await repository.deleteGeofences(geofenceIds, storeName);
    await repository.deleteStore(storeName);
});

test('geofenceEvent point in MIDDLE geofence EXISTING order', async t => {
    const storeName = chance.word();
    let store = utils.createStore(storeName);
    await repository.insertStore(store);

    let geofences = utils.createGeofences();
    await repository.insertGeofences(geofences, storeName);

    const order = utils.createOrders(storeName)[0];
    await repository.saveOrder(order, storeName);

    const evt = utils.createEvent(storeName, order.orderId);
    await geofencing.geofenceEvent(evt);

    const latestEvent = utils.createLatestEvent();
    latestEvent.geofences.sort((first, second) => first.range - second.range);
    latestEvent.geofences[0].intersectsEvent = false; // inner
    latestEvent.geofences[1].intersectsEvent = true; // middle
    latestEvent.geofences[2].intersectsEvent = true; //outer
    latestEvent.innerGeofence = latestEvent.geofences[1];
    const expected = {
        orderId: order.orderId,
        storeName: storeName,
        status: ['open'],
        latestEvent: latestEvent
    }

    const orders = await repository.getOrdersByStore(storeName);
    t.deepEqual(orders[0], expected);

    await repository.deleteOrder(order.orderId, storeName);
    geofences = await repository.getGeofencesByStore(storeName);
    const geofenceIds = geofences.map(geofence => geofence.id);
    await repository.deleteGeofences(geofenceIds, storeName);
    await repository.deleteStore(storeName);
});
