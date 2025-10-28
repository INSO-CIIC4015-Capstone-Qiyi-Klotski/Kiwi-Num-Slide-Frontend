

## Prerequisites
- Docker installed and configured.

## Run with Docker

### Development (with hot reloading)
~~~bash
docker-compose up --build
~~~

### Production
~~~bash
docker build -t qk-frontend .
docker run --rm -p 3000:80 qk-frontend
~~~

Open http://localhost:3000

> Development mode includes hot reloading - no need to rebuild after code changes.
