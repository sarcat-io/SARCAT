FROM node:lts-alpine
LABEL sarcat=true
LABEL sarcat_type=system
LABEL sarcat_version=1.0.1
VOLUME ["/sarcat_system/__SARCAT_ARCHIVE"]
WORKDIR /sarcat_system
RUN apk upgrade --update-cache --available && \
    apk add p7zip bash && \
    rm -rf /var/cache/apk/*
COPY . .
WORKDIR /sarcat_system/!application!
RUN npm install
