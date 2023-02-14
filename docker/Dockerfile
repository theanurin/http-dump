ARG IMAGE=node:18-alpine
ARG BUILD_CONFIGURATION=release


#
#   ____    _   _   ___   _       ____      ____    _   _      _      ____    _____
#  | __ )  | | | | |_ _| | |     |  _ \    |  _ \  | | | |    / \    / ___|  | ____|
#  |  _ \  | | | |  | |  | |     | | | |   | |_) | | |_| |   / _ \   \___ \  |  _|
#  | |_) | | |_| |  | |  | |___  | |_| |   |  __/  |  _  |  / ___ \   ___) | | |___
#  |____/   \___/  |___| |_____| |____/    |_|     |_| |_| /_/   \_\ |____/  |_____|
#

FROM ${IMAGE} AS builder1
ARG BUILD_CONFIGURATION
ARG BUILD_COMMIT_REF
ARG BUILD_COMMIT_TIMESTAMP
ARG BUILD_PIPELINE_URL
ARG BUILD_PROJECT_URL
ARG BUILD_RC_VERSION
ARG BUILD_TAG_VERSION
ARG BUILD_VERSION_APPENDER
RUN apk add --no-cache jq moreutils
COPY bin/app.js                                                         /stage/usr/local/theanurin/http-dump/bin/
COPY docker/docker-entrypoint-http-dump.sh                              /stage/usr/local/bin/docker-entrypoint-http-dump.sh
COPY package.json package-lock.json                                     /stage/usr/local/theanurin/http-dump/
RUN \
  set -e; \
  PROJ_VERSION="$(jq -r '.version' /stage/usr/local/theanurin/http-dump/package.json)"; \
  set +e; \
  if [ -n "${BUILD_TAG_VERSION}" ]; then \
    if [ "${BUILD_TAG_VERSION}" != "${PROJ_VERSION}" ]; then \
      echo "Project version '${PROJ_VERSION}' is not same to tag version '${BUILD_TAG_VERSION}'. Cannot continue. Try to set correct project before tag creation." >&2; \
      exit 1; \
    fi; \
  fi; \
  if [ -n "${BUILD_RC_VERSION}" ]; then \
    if [ "${BUILD_RC_VERSION}" != "${PROJ_VERSION}" ]; then \
      echo "Project version '${PROJ_VERSION}' is not same to RC tag version '${BUILD_RC_VERSION}'. Cannot continue. Try to set correct project before tag creation." >&2; \
      exit 1; \
    fi; \
  fi; \
  if [ -n "${BUILD_VERSION_APPENDER}" ]; then \
    PROJ_SPEC=$(jq ".version = \"${PROJ_VERSION}${BUILD_VERSION_APPENDER}\"" /stage/usr/local/theanurin/http-dump/package.json); \
    echo -E "${PROJ_SPEC}" > /stage/usr/local/theanurin/http-dump/package.json; \
  fi;
COPY src                                                                /build/src
COPY package.json package-lock.json tsconfig.json                       /build/
RUN chmod +x /stage/usr/local/bin/docker-entrypoint-http-dump.sh
WORKDIR /build
RUN npm install --progress=false
RUN mkdir -p /stage/usr/local/theanurin/http-dump
RUN npx tsc --project tsconfig.json --rootDir /build --outDir /stage/usr/local/theanurin/http-dump
RUN cd /stage/usr/local/theanurin/http-dump/ && npm install --omit=dev --progress=false
RUN jq -M ".build.project_url=\"${BUILD_PROJECT_URL}\"" < /stage/usr/local/theanurin/http-dump/package.json | sponge /stage/usr/local/theanurin/http-dump/package.json
RUN jq -M ".build.commit.reference=\"${BUILD_COMMIT_REF}\"" < /stage/usr/local/theanurin/http-dump/package.json | sponge /stage/usr/local/theanurin/http-dump/package.json
RUN jq -M ".build.pipeline_url=\"${BUILD_PIPELINE_URL}\"" < /stage/usr/local/theanurin/http-dump/package.json | sponge /stage/usr/local/theanurin/http-dump/package.json
RUN jq -M ".build.timestamp=\"${BUILD_COMMIT_TIMESTAMP}\"" < /stage/usr/local/theanurin/http-dump/package.json | sponge /stage/usr/local/theanurin/http-dump/package.json
RUN jq -M ".build.configuration=\"${BUILD_CONFIGURATION}\"" < /stage/usr/local/theanurin/http-dump/package.json | sponge /stage/usr/local/theanurin/http-dump/package.json

#
#   ____    ___    __  __   ____     ___    ____    ___   _____   _____     ____    _   _      _      ____    _____
#  / ___|  / _ \  |  \/  | |  _ \   / _ \  / ___|  |_ _| |_   _| | ____|   |  _ \  | | | |    / \    / ___|  | ____|
# | |     | | | | | |\/| | | |_) | | | | | \___ \   | |    | |   |  _|     | |_) | | |_| |   / _ \   \___ \  |  _|
# | |___  | |_| | | |  | | |  __/  | |_| |  ___) |  | |    | |   | |___    |  __/  |  _  |  / ___ \   ___) | | |___
#  \____|  \___/  |_|  |_| |_|      \___/  |____/  |___|   |_|   |_____|   |_|     |_| |_| /_/   \_\ |____/  |_____|
#


# Compositor merges all artifacts between builds
FROM ${IMAGE} AS compositor_base

FROM compositor_base AS compositor_snapshot
# Nothing special for 'snapshot' at composite phase

FROM compositor_base AS compositor_release
# Nothing special for 'release' at composite phase

FROM compositor_${BUILD_CONFIGURATION} AS compositor
COPY --from=builder1 /stage /stage
#COPY --from=builder2 /stage /stage
#COPY --from=builder3 /stage /stage



#
#   ___   __  __      _       ____   _____     ____    _   _      _      ____    _____
#  |_ _| |  \/  |    / \     / ___| | ____|   |  _ \  | | | |    / \    / ___|  | ____|
#   | |  | |\/| |   / _ \   | |  _  |  _|     | |_) | | |_| |   / _ \   \___ \  |  _|
#   | |  | |  | |  / ___ \  | |_| | | |___    |  __/  |  _  |  / ___ \   ___) | | |___
#  |___| |_|  |_| /_/   \_\  \____| |_____|   |_|     |_| |_| /_/   \_\ |____/  |_____|
#

# Base imager
FROM ${IMAGE} AS imager_base

# Imager for 'snapshot' build includes snapshot related stuff into final image
FROM imager_base AS imager_snapshot
RUN apk add --no-cache curl
ONBUILD ENV DO_INIT_SLEEP=4

# Imager for 'release' build includes release related stuff into final image
FROM imager_base AS imager_release
# Nothing special for 'release' at imager phase

# Final image
FROM imager_${BUILD_CONFIGURATION}
COPY --from=compositor /stage/ /
# Update OpenSSL CA certificates bundle to register runtime certificates
# RUN update-ca-certificates
EXPOSE 8080
ENV DO_INIT_SLEEP=
ENV DUMP_DIRECTORY="/data"
ENV DUMP_FILE_PREFIX=""
VOLUME [ "${DUMP_DIRECTORY}" ]
ENTRYPOINT [ "/usr/local/bin/docker-entrypoint-http-dump.sh" ]
CMD [ "--config-env" ]
