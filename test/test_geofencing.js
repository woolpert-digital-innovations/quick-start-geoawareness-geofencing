const test = require('ava');
const geofencing = require('../geofencing');
const repository = require('../repository');
const utils = require('./test_utils');
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

// test('doGeofencing point in INNER geofence', async t => {
//     const originalOrder = await repository.getOrder('13579', 'carmelit');
//     const evt = {
//         ...utils.createEvent(),
//         eventLocation: {
//             longitude: -93.220024,
//             latitude: 36.650717
//         }
//     };

//     await geofencing.geofenceEvent(evt);

//     const latestEvent = {
//         ...utils.createLatestEvent(),
//         eventLocation: {
//             longitude: -93.220024,
//             latitude: 36.650717
//         }
//     }
//     latestEvent.geofences.sort((first, second) => first.range - second.range);
//     latestEvent.geofences.forEach(geofence => {
//         geofence.intersectsEvent = true;
//     });
//     latestEvent.innerGeofence = latestEvent.geofences[0];
//     const expected = {
//         ...utils.createOrders()[0],
//         latestEvent: latestEvent
//     }

//     const updatedOrder = await repository.getOrder('13579', 'carmelit');
//     t.deepEqual(updatedOrder, expected);

//     await repository.saveOrder(originalOrder, 'carmelit');
// });

test('geofenceEvent point in MIDDLE geofence', async t => {
    const originalOrder = await repository.getOrder('13579', 'carmelit');

    const evt = utils.createEvent();
    await geofencing.geofenceEvent(evt);

    const latestEvent = utils.createLatestEvent();
    latestEvent.geofences.sort((first, second) => first.range - second.range);
    latestEvent.geofences[0].intersectsEvent = false; // inner
    latestEvent.geofences[1].intersectsEvent = true; // middle
    latestEvent.geofences[2].intersectsEvent = true; //outer
    latestEvent.innerGeofence = latestEvent.geofences[1];
    const expected = {
        ...utils.createOrders()[0],
        latestEvent: latestEvent
    }

    const updatedOrder = await repository.getOrder('13579', 'carmelit');
    t.deepEqual(updatedOrder, expected);

    await repository.saveOrder(originalOrder, 'carmelit');
});