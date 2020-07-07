# geoawareness-geofencing

The Geofencing service performs the following operations:

1. Listens for telemetry event messages in the geoawareness-ingest Pub/Sub topic
1. Intersects events against geofence polygons stored in Datastore
1. Writes the results to Order and Event documents in Datastore

## Getting Started

Create service account.

Example - _geoawareness@geoawareness-sandbox.iam.gserviceaccount.com_.

The service account must have the following minimum permissions:

- Firestore Datastore User
- Pub/Sub Subscriber
- Pub/Sub Publisher (demo script only)

Configure gcloud shell environment.

```
export PROJECT_ID=<YOUR_PROJECT_ID>
export GCP_ZONE=<YOUR_GCP_ZONE>

gcloud config set project $PROJECT_ID
export GOOGLE_APPLICATION_CREDENTIALS=geoawareness@$PROJECT_ID.iam.gserviceaccount.com
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

## Deploying

```
gcloud services enable containerregistry.googleapis.com
docker build . -t gcr.io/$PROJECT_ID/geoawareness-geofencing-service
docker push gcr.io/$PROJECT_ID/geoawareness-geofencing-service

gcloud compute instances create-with-container geoawareness-geofencing-service  \
--container-image=gcr.io/$PROJECT_ID/geoawareness-geofencing-service \
--service-account=geoawareness@$PROJECT_ID.iam.gserviceaccount.com \
--scopes=default,pubsub,datastore \
--machine-type=e2-micro \
--zone=$GCP_ZONE
```

The listener is ready to handle messages from the ingest topic as a pull subscriber.

### Smoke test

```
gcloud pubsub topics publish geoawareness-ingest --message="$(jq '.[0]' < ./test/fakes/events.json)"
```

### Updating deployed container

```
docker build . -t gcr.io/$PROJECT_ID/geoawareness-geofencing-service
docker push gcr.io/$PROJECT_ID/geoawareness-geofencing-service
gcloud compute instances update-container geoawareness-geofencing-service --container-image gcr.io/$PROJECT_ID/geoawareness-geofencing-service
```
