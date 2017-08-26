# build SOS Docker from source

Adapted from <https://github.com/52North/docker-images>.

The source repo & branch can be configured through the following environment variables:

- `SOS_REPO`: default `https://github.com/52North/SOS`
- `SOS_BRANCH`: default `feature/mqtt`

> **Warning**: the build fetches all maven dependencies each time again. this takes *quite* some time.. I didn't try to cache these yet as is done [here](https://github.com/ioos/i52n-sos/blob/master/Dockerfile)
