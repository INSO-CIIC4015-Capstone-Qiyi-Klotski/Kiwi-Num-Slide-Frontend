

## Prerequisites
- Docker installed and configured.

## Run with Docker
~~~bash
docker build -t qk-frontend .
docker run --rm -p 3000:80 qk-frontend
~~~

Open http://localhost:3000

> Rebuild the image after code changes to see updates.
