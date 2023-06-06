#!/bin/bash

app_name=reflection-api
timestamp=$(date -u '+%s.%3NZ')
image_name=registry.fly.io/$app_name:$npm_package_version-$timestamp
export app_name
export timestamp
export image_name

./build_docker.sh
fly deploy --app $app_name --image $image_name

$SHELL