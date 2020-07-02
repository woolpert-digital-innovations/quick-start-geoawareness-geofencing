# geoawareness-geofencing

## Getting Started

Configure gcloud shell environment.

```
gcloud config set project PROJECT_ID
export GOOGLE_APPLICATION_CREDENTIALS=<service-account-credentials.json>
```

Seed Firestore (DataStore mode) database.

```
node test/seed_repository.js
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

Set up Pub/Sub

```
gcloud pubsub topics create geoawareness-ingest
gcloud pubsub subscriptions create geoawareness-geofencing-service --topic geoawareness-ingest
```
