#!/bin/sh

set -
WORKDIR=$(
  cd "$(dirname "$0")" || exit
  pwd
)

if [ -z "$2" ]; then
  VERSION="latest"
else
  VERSION=$2
fi

# build code
code() {
  /bin/sh $WORKDIR/mvn clean package -DskipTests
  # mv release zip
  mv $WORKDIR/seatunnel-web-dist/target/apache-seatunnel-web-*.zip $WORKDIR/
}

# build image
image() {
  docker  build  -t seatunnel-web:1.0.0 -f backend.dockerfile .
}

# main
case "$1" in
"code")
  code
  ;;
"image")
  image
  ;;
*)
  echo "Usage: build.sh {code|image}"
  exit 1
  ;;
esac
set +
