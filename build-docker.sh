#!/bin/bash

npm run bump-minor
npm run compile
timestamp=$(date -u '+%s.%3NZ')
image_name=registry.fly.io/reflection-api:$npm_package_version-$timestamp
docker build -t $image_name .
docker push $image_name

$SHELL