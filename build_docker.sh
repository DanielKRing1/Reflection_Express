#!/bin/bash

# npm run bump-minor
# npm run compile
[ -z "$app_name" ] && app_name=reflection-api
[ -z "$timestamp" ] && timestamp=$(date -u '+%s.%3NZ')
[ -z "$image_name" ] && image_name=registry.fly.io/$app_name:$npm_package_version-$timestamp
docker build -t $image_name .
docker push $image_name
# docker run --env-file ./env/.env.prod $image_name

echo build_docker script completed

# $SHELL