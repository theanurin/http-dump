[![Build Release Status](https://github.com/theanurin/http-dump/actions/workflows/docker-image-release.yml/badge.svg)](https://github.com/theanurin/http-dump/actions/workflows/docker-image-release.yml)
[![Build Snapshot Status](https://github.com/theanurin/http-dump/actions/workflows/docker-image-snapshot.yml/badge.svg)](https://github.com/theanurin/http-dump/actions/workflows/docker-image-snapshot.yml)
[![Docker Image Version](https://img.shields.io/docker/v/theanurin/http-dump?sort=date&label=Version)](https://hub.docker.com/r/theanurin/http-dump/tags)
[![Docker Image Size](https://img.shields.io/docker/image-size/theanurin/http-dump?label=Image%20Size)](https://hub.docker.com/r/theanurin/http-dump/tags)
[![Docker Pulls](https://img.shields.io/docker/pulls/theanurin/http-dump?label=Image%20Pulls)](https://hub.docker.com/r/theanurin/http-dump)
[![Docker Stars](https://img.shields.io/docker/stars/theanurin/http-dump?label=Image%20Stars)](https://hub.docker.com/r/theanurin/http-dump)


# HTTP Dump Tool

A simple HTTP server that dumps the request to files. **HTTP Dump** was created to help dumping Webhook messages into files.


# Launch

```shell
# Optional. Default: "/data"
export DUMP_DIRECTORY="/data"

# Optional. Default: ""
export DUMP_FILE_PREFIX=""

docker run \
  --rm \
  --interactive \
  --tty \
  --env DUMP_DIRECTORY \
  --env DUMP_FILE_PREFIX \
  --publish 127.0.0.1:8080:8080/tcp \
  --volume "$PWD/.data:$DUMP_DIRECTORY" \
  theanurin/http-dump
```

After start, any requests to http://127.0.0.1:8080/ will save as dump files in `DUMP_DIRECTORY`.

# Support

* Maintained by: [Max Anurin](https://www.anurin.name)
* Where to get help: [Telegram Channel](https://t.me/theanurin)

