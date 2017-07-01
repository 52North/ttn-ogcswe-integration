FROM node:6-alpine

RUN apk --no-cache --virtual .build add python make g++ git ca-certificates

# taken from node:6-onbuild
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn install --pure-lockfile
COPY . /usr/src/app

RUN apk del .build

ENV TTN_MQTT_CERT /app/mqtt-ca.pem

CMD [ "npm", "start" ]
