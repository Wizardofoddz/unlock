
#!/usr/bin/env bash

# This script saves a docker image

IMAGE_NAME=$1
CACHE_FILE="${CACHE_DIR}/$IMAGE_NAME.tar.gz"

ls -la $CACHE_DIR

if [ -f ${CACHE_FILE} ]; then
  gunzip -c ${CACHE_FILE} | docker load
fi

docker images