#!/bin/sh
# Wait for DATABASE_URL to be injected by ECS
for i in $(seq 1 30); do
  if [ -n "$DATABASE_URL" ]; then
    break
  fi
  echo "Waiting for DATABASE_URL... ($i/30)"
  sleep 1
done

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set after 30 seconds"
  exit 1
fi

exec "$@"