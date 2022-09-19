FROM node:lts-alpine
LABEL sarcat=true
LABEL sarcat_type=system
LABEL sarcat_version=1.0.1
VOLUME ["/sarcat_system/__SARCAT_ARCHIVE/bundles/|||bundle_label|||/02_assessment-data"]
WORKDIR /sarcat_system
RUN apk
COPY . .
WORKDIR /sarcat_system/!application!
RUN npm install
ENTRYPOINT [ "node","index.mjs" ]
