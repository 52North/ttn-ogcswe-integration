# ttn-ogcswe-integration developer guide

This project is written for node.js 6.x in TypeScript, which needs to be compiled
to javascript before running.
The source is managed using *git flow*, where features are developed on feature
branches and then pulled into the `develop` branch.

## dev env setup
1. Install the following dependencies:

- [node.js 6.x](https://nodejs.org/en/download/) or later: javascript runtime
- [yarn](https://yarnpkg.com/): package manger & launcher
- git: source control

2. Follow the instructions under `Native Installation` in `README.md`.

3. Register an application in TheThingsNetwork, and create a key for it.
    Insert the Application ID and the key into `config.yml`.

4. Set up an development instance of the storage backend you want to develop against.
    For the 52N SOS a docker image is defined in `docker/sos`.
    Enter its address at `broker.options.host` in `config.yml`.

## build cycle
1. create a feature branch: `git checkout develop && git checkout -b feature/myfeature`
1. launch your storage backend and make sure `config.yml` correctly points to it
1. run `yarn build:watch` to start the build process on each source change.
4. Make changes in `src/**`.
1. (re)start the application with `yarn start` and test.
    - to do end to end tests without a LoRa device, you can simulate TTN uplink
       messages at the device view in `console.thethingsnetwork.org` or using [ttnctl](https://www.thethingsnetwork.org/docs/network/cli/).
1. repeat from step 4 until a (sub)feature is working/fixed.
1. lint the code using `yarn lint` and fix errors as suggested.
1. commit using `git commit`
1. create a pull request on github to `develop`.

Please make sure your code fits the style of the existing codebase, and verify
with `yarn lint` *before* committing.
