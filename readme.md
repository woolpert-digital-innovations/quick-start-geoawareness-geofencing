# geoawareness-geofencing

The Geofencing service performs the following operations:

1. Listens for telemetry event messages in the geoawareness-ingest Pub/Sub topic
1. Intersects events against geofence polygons stored in Datastore
1. Writes the results to Order and Event documents in Datastore

## Getting Started

Configure gcloud shell environment.

```
export PROJECT_ID=<YOUR_PROJECT_ID>
export GCP_ZONE=<YOUR_GCP_ZONE>

gcloud config set project $PROJECT_ID
export NEW_EVENT_STATUS=open # optional
export INGEST_SUBSCRIPTION_NAME=geoawareness-geofencing-service # optional
```

Create service account. Example - _geoawareness@geoawareness-sandbox.iam.gserviceaccount.com_.

```
gcloud iam service-accounts create geoawareness
gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:geoawareness@$PROJECT_ID.iam.gserviceaccount.com --role=roles/editor
```

Create key for service account and download credentials json file.

```
export GOOGLE_APPLICATION_CREDENTIALS=geoawareness-service-account-credentials.json
```

The service account must have the following minimum permissions:

- Firestore Datastore User
- Pub/Sub Subscriber
- Pub/Sub Publisher (demo script only)

### Datastore

Create a new [Datastore database](https://cloud.google.com/datastore/docs/quickstart#create_a_database) in the GCP project you created earlier.

Build Datastore indexes.

```
gcloud datastore indexes create index.yaml
```

### Pub/Sub

Create Pub/Sub topic and subscription.

```
gcloud pubsub topics create geoawareness-ingest
gcloud pubsub subscriptions create geoawareness-geofencing-service --topic geoawareness-ingest
```

## Run tests

```
npm install
npm test
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
node demo-script/drive-route.js
```

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
