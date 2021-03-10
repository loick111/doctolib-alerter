#!/bin/sh

if [ ! -f "config.json" ]
then
    echo "Error: missing 'config.json' file"
    exit 1
fi

if [ -z "${POSTAL_PATTERN}" ]
then
    echo "Error: missing POSTAL_PATTERN env variable"
    exit 1
fi

if [ -z "${INTERVAL}" ]
then
    echo "Error: missing INTERVAL env variable"
    exit 1
fi

npm start --silent -- retrieve --postal_pattern "${POSTAL_PATTERN}"
npm start --silent -- check --interval "${INTERVAL}"