#!/bin/bash

# var=Start
# export var

# echo $var
# ./test.sh
# ./test2.sh

. ./env/.env.prod
npm run start_fly

# timestamp=$(date -u '+%Y-%m-%dT%H-%M:%S.%3NZ')
# timestamp=$(date -u '+%s.%3NZ')
# echo $timestamp

# test=registry.fly.io/reflection-api:v$npm_package_version-$timestamp
# echo $test

$SHELL