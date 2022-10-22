#!/bin/sh
#

if [ -z "${DUMP_DIRECTORY}" ]; then
	echo "{ \"level\":\"fatal\", \"message\": \"A DUMP_DIRECTORY variable is empty. Cannot continue.\" }" >&2
	exit 1
fi

# allow the container to be started with `--user`
if [ "$(id -u)" = '0' ]; then
	echo "{ \"level\":\"info\", \"message\": \"Started as user 'root'.\" }"

	echo "{ \"level\":\"info\", \"message\": \"Fixing pemissions for '${DUMP_DIRECTORY}' directory.\" }"
	chown node "${DUMP_DIRECTORY}"
	chmod 777  "${DUMP_DIRECTORY}"

	echo "{ \"level\":\"info\", \"message\": \"Restarting as user 'node'...\" }"
	exec su node "$0" -- "$@"
else
	echo "{ \"level\":\"info\", \"message\": \"Started as user '$(id -u -n)'.\" }"

	# The -O file option tests if file exists and is owned by the effective user ID.
	if [ ! -O "${DUMP_DIRECTORY}" ]; then
		echo "{ \"level\":\"fatal\", \"message\": \"A '${DUMP_DIRECTORY}' directory should be owned by started user. Cannot continue.\" }" >&2
		exit 2
	fi
fi


if [ -n "${DO_INIT_SLEEP}" ]; then
	DO_INIT_SLEEP=$(( ${DO_INIT_SLEEP} + 0 ))
	if [ ${DO_INIT_SLEEP} -gt 0 ]; then
		echo "{ \"level\":\"info\", \"message\": \"Initial sleep ${DO_INIT_SLEEP} seconds...\" }"
		while [ ${DO_INIT_SLEEP} -gt 0 ]; do
			DO_INIT_SLEEP=$(( ${DO_INIT_SLEEP} - 1 ))
			sleep 1
		done
	fi
fi

set -e

# Start the service
cd /usr/local/theanurin/http-dump
exec node "bin/app.js" $@
