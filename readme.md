# geoawareness-geofencing

The Geofencing service listens for messages in the geoawareness-ingest pubsub topic, performs geofencing operations against geofence polygons stored in Firestore, and writes the results to Firestore Order and Event documents.

## Getting Started

Create service account. The service account must have the following minimum permissions:

- Firestore Datastore User
- Pub/Sub Subscriber
- Pub/Sub Publisher (demo script only)

Configure gcloud shell environment.

```
gcloud config set project PROJECT_ID
export GOOGLE_APPLICATION_CREDENTIALS=<service-account-credentials.json>
export NEW_EVENT_STATUS=open # optional
export INGEST_SUBSCRIPTION_NAME=geoawareness-geofencing-service # optional
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

Create Pub/Sub topic and subscription.

```
gcloud pubsub topics create geoawareness-ingest
gcloud pubsub subscriptions create geoawareness-geofencing-service --topic geoawareness-ingest
```

## Run demo

Seed Firestore (DataStore mode) database.

```
node test/seed_repository.js
```

Launch the pubsub listener.

```
node listener.js
```

Send mock telemetry events for the Dalton Drive route.

```
node demo-script/drive-route.js
```
