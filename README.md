# The Things Network -- OGC SensorWeb Integration

> **status:** early WIP, nonfunctional!

This is a node.js based integration between The Things Network (TTN) and the OGC SensorWeb providing seamless measurement upload from LoRaWAN devices into OGC infrastructure.

Besides measurement upload, the goal is to manage devices in both platforms consistently by automatically registering or updating them in the counterpart platform.

Developed in the course of 52North's Student Innovation Challenge 2017.

## Installation & Configuration

Requires `node >= v6.x` and `yarn`. To install, run `yarn install` then do configuration in `.env` (`cp .env.sample .env`).

To run the application: `yarn build && yarn start`. For other scripts, see `package.json`.
