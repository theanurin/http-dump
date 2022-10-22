# Docker Image

## Build manually

Execute following at project root:

```shell
export BUILD_PROJECT_URL=https://github.com/theanurin/http-dump
export BUILD_PIPELINE_URL=http://localhost
export BUILD_COMMIT_REF=00000000
export BUILD_COMMIT_TIMESTAMP=2021-03-07T12:26:30.582505Z
export BUILD_CONFIGURATION=snapshot  # snapshot or release
```

ARM Build (MacBook Air)

```shell
docker build \
  --tag http-dump \
  --platform=linux/arm64/v8 \
  --progress=plain \
  --build-arg BUILD_CONFIGURATION \
  --build-arg BUILD_PROJECT_URL \
  --build-arg BUILD_PIPELINE_URL \
  --build-arg BUILD_COMMIT_REF \
  --build-arg BUILD_COMMIT_TIMESTAMP \
  --file docker/Dockerfile \
  .
```

Build AMD64 (x64_86)

```shell
docker build \
  --tag http-dump \
  --platform=linux/amd64 \
  --progress=plain \
  --build-arg BUILD_CONFIGURATION \
  --build-arg BUILD_PROJECT_URL \
  --build-arg BUILD_PIPELINE_URL \
  --build-arg BUILD_COMMIT_REF \
  --build-arg BUILD_COMMIT_TIMESTAMP \
  --file docker/Dockerfile \
  .
```

## Run manually

```bash
IMAGE=http-dump
#IMAGE=ghcr.io/theanurin/http-dump/snapshot

docker run --rm --interactive --tty --entrypoint /bin/sh $IMAGE
docker run --rm --interactive --tty --publish 8080:8080/tcp $IMAGE
```
