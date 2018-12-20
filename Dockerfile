FROM node:10-alpine

RUN apk --no-cache --virtual .build add python make g++ git ca-certificates \
    && mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY . /usr/src/app/

RUN yarn install --pure-lockfile \
    && yarn build \
    && apk del .build

CMD [ "npm", "start" ]
