FROM tomcat:9
MAINTAINER <noerw@github>

WORKDIR /tmp

ENV SOS_REPO https://github.com/52North/SOS
ENV SOS_BRANCH master

#COPY tomcat-conf/* $CATALINA_HOME/conf/
#COPY rest-api-config/* sos-webapp/WEB-INF/classes/
COPY tomcat-conf/ /tmp/tomcat-conf/
COPY rest-api-config/ /tmp/rest-api-config/
COPY helgoland-config/ /tmp/helgoland-config/

# build the sos from source & copy the build to sos-webapp
RUN apt-get update
RUN apt-get install -y git maven openjdk-8-jdk-headless

RUN git clone $SOS_REPO -b $SOS_BRANCH --depth=1 SOS-src
RUN cd SOS-src \
    && mvn clean install \
    && cd .. \
    && cp -R SOS-src/webapp-bundle/target/52n-sos-webapp sos-webapp

# copy the config
RUN cp -R /tmp/tomcat-conf/* $CATALINA_HOME/conf/ \
    && cp -R /tmp/rest-api-config/* sos-webapp/WEB-INF/

# build the helgoland frontend
# RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
# RUN apt-get -y install nodejs git g++ python pkg-config libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev build-essential
# RUN npm install -g grunt grunt-cli node-gyp
# RUN curl -L -o helgoland.zip https://github.com/52North/helgoland/archive/v1.0.0.zip \
#     && unzip -d helgoland helgoland.zip
# RUN cd helgoland/helgoland-1.0.0 \
#     && npm install && grunt \
#     && cp /tmp/helgoland-config/* dist/ \
#     && cp -R dist/ ../../sos-webapp/static/client/helgoland \
#     && cd ../../ \

# copy the result to catalina home, clean up build dependencies
RUN cp -R sos-webapp/ $CATALINA_HOME/webapps/52n-sos-webapp \
    && rm -rf SOS-src \
#    && npm uninstall -g grunt grunt-cli node-gyp \
    && apt-get -y purge nodejs git python g++ python python3.5 python2.7 python3 pkg-config libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev build-essential git maven openjdk-8-jdk-headless \
    && apt-get -y autoremove --purge \
    && apt-get clean \
    && rm -rf /tmp/* && rm -rf /usr/lib/node_modules && rm -rf /root/.npm && rm -rf /root/.m2

ENV JAVA_OPTS="-XX:PermSize=4096m -XX:MaxPermSize=3072m"
