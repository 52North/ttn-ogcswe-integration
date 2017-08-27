# Docker setup

This docker-compose setup provides you with

- a running SOS instance, proxied with https
- an empty PostGIS DB
- the `ttn-ogcswe-integration`

The `docker-compose.yml` contains examples for different SOS build sources.

## Configuration
You need to  `cp config.yml.sample config.yml` and `cp Caddyfile.sample Caddyfile`
and change the default values. In `Caddyfile`, just insert your domain name
(if you dont have a domain, remove the caddy service in `docker-compose.yml`).

For configuration options of the TTN integration, please refer to <https://github.com/noerw/ttn-ogcswe-integration/README.md>

## Run
1. Install git, [Docker](https://docs.docker.com/engine/installation/) & [docker-compose](https://docs.docker.com/compose/install/)

2. Get this docker-compose definition:
    ```sh
    git clone --depth=1 https://github.com/noerw/ttn-ogcswe-integration
    cd ttn-ogcswe-integration/docker
    ```
3. configure the docker containers
    - `Caddyfile`: insert your domain
    - `config.yml`: insert TTN credentials, configure sensors
    - (`docker-compose.yml`: customize source of SOS build)
4. start it:
    ```sh
    docker-compose up
    ```
5. configure your sos instance in the browser.
    - make shure to enable the Transactional API 
6. done!
