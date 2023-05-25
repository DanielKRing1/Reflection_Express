#!/bin/bash

# npx prisma generate
# npm run start_fly

# timestamp=$(date -u '+%Y-%m-%dT%H-%M:%S.%3NZ')
timestamp=$(date -u '+%S.%3NZ')
echo $timestamp

test=registry.fly.io/reflection-api:v$npm_package_version-$timestamp
echo $test

$SHELL