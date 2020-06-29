# geoawareness-geofencing

## Getting Started
Configure gcloud shell environment.
```
gcloud config set project PROJECT_ID
```

Seed Firestore (DataStore mode) database.
```
node seed_repository.js
```

Create Datastore indexes.
```
gcloud datastore indexes create index.yaml
```

Run tests.
```
npm install
npm test
```