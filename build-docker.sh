#!/bin/bash

npm run bump-minor
npm run compile
docker build -t registry.fly.io/reflection-api:$npm_package_version .

$SHELL