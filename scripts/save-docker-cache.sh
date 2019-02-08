
#!/usr/bin/env bash

# This script saves a docker image

IMAGE_NAME=$1


if [[ $TRAVIS_TEST_RESULT = 0 ]]; then
  if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
    mkdir -p $CACHE_DIR
    docker save $IMAGE_NAME:latest | gzip > "${CACHE_DIR}/$IMAGE_NAME.tar.gz"
  fi
fi

