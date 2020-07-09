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
export GOOGLE_APPLICATION_CREDENTIALS=geoawareness-service-account-credentials.json
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
node demo/seed_repository.js
```

Launch the pubsub listener.

```
node listener.js
```

Send mock telemetry events for the Dalton Drive route.

```
node demo/drive-route.js
```

## Run Demo (existing infra)

If you want to use existing infrastructure and only need to run the demo follow these steps to ingest messages.

1. Download a new json key for the `geoawareness@geoawareness-sandbox.iam.gserviceaccount.com` service account in the `geoawareness-sandbox` project, or, the relevant account in the relevant project you wish to ingest to.

1. Save the newly download json file to `~/.keys/geowareness-runner.json` for example.

1. Run the demo

       export GOOGLE_APPLICATION_CREDENTIALS=~/.keys/geoawareness-runner.json && node demo/drive-route.js

## Deploying

```
gcloud services enable containerregistry.googleapis.com
gcloud builds submit --tag gcr.io/$PROJECT_ID/geoawareness-geofencing-service

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
gcloud builds submit --tag gcr.io/$PROJECT_ID/geoawareness-geofencing-service
gcloud compute instances update-container geoawareness-geofencing-service --container-image gcr.io/$PROJECT_ID/geoawareness-geofencing-service
```
