# geoawareness-geofencing

## Getting Started
<<<<<<< HEAD
Configure gcloud shell environment.
=======
Configure gcloud shell environment
>>>>>>> 3f9ac2e... README and extract repository seeding script
```
gcloud config set project PROJECT_ID
```

<<<<<<< HEAD
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
=======
Create Datastore indexes
```
gcloud datastore indexes create index.yaml
```

Seed database
```
node seed_repository.js
```

Run tests
```
>>>>>>> 3f9ac2e... README and extract repository seeding script
npm test
```