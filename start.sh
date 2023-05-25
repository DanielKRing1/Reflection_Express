#!/bin/bash

# npx prisma generate
# npm run start_fly

timestamp=$(date)
echo $timestamp

test=registry.fly.io/reflection-api:$npm_package_version-$timestamp
echo $test

$SHELL