const test = require('ava');
const repository = require('../repository');
const seedRepo = require('./seed_repository');

test.before(async t => {
    await seedRepo.seedStore();
    await seedRepo.seedGeofences();
});

test('getStore store exists', async t => {
    const store = await repository.getStore('carmelit');
    t.is(store.name, 'carmelit');
});

test('getStore no store', async t => {
    const store = await repository.getStore('nybohov');
    t.is(store, null);
});

test('getGeofencesByStore store exists', async t => {
    const geofences = await repository.getGeofencesByStore('carmelit');
    const expected = seedRepo.createGeofences();
    t.deepEqual(geofences, expected);
});

test('getGeofencesByStore no store', async t => {
    const geofences = await repository.getGeofencesByStore('nybohov');
    t.deepEqual(geofences, []);
});
