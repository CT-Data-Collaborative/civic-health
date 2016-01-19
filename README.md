# Civic Health Dashboard 

Serverless single page application for serving Civic Health Dashboard report application. Designed to be hosted on s3 
or ssimilar service. 

 
### Includes:
- gulp tasks for compiling sass and building angular project file from modularized js files
- s3-upload for deployment to s3 bucket

### Getting started

First install the local node dependencies which we need for managing serving, sass compilation, 
building the final app.js file, and deploying to s3

```npm install```

Then install the front-end dependencies using bower.

```bower install```

The front-end files will end up in the ```static/dist/bower_components``` directory.

### Developing locally

```gulp js``` and ```gulp sass``` will build/compile the angular and sass files respectively.

```gulp``` will launch a local dev server that will serve ```index.html```
up at ```localhost:8080``` or ```0.0.0.0:8080```. It will also watch your ```sass``` and ```js```
directories and will recompile/rebuild files as needed.

### Deployment

The `aws-upload.conf.js` file contains the file path specifications for deploying. Adding new directories to the 
application requires modifying these settings. 

Follow [these](https://www.npmjs.com/package/s3-upload) instructions for setting up an destination s3 bucket.

The `aws-credentials.json` file is exclude from version control by default. Do not override unless you are working with 
a private git repo and do not intended to make public.

After configuring, deployment is as easy as running `s3-upload` from the application directory. Files will upload
incrementally.
