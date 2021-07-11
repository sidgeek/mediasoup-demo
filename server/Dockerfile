FROM node:10 AS stage-one

# Install DEB dependencies and others.
RUN \
	set -x \
	&& apt-get update \
	&& apt-get install -y net-tools build-essential valgrind

WORKDIR /service

COPY package.json .
RUN npm install
COPY server server
COPY config.js .
COPY lib lib
COPY certs certs

CMD ["node", "/service/server/index.js"]
