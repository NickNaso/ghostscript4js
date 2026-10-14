# Official Node.js 24 image based on Debian bookworm (has Ghostscript 10 in its archive)
FROM node:24-bookworm

RUN apt-get update \
    && apt-get --yes install --no-install-recommends ghostscript libgs-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

# Only copy the package.json for now
# If it didn't change this will improve build time because node_modules can be cached
# https://christianfei.com/posts/Cache-speed-up-docker-node-modules/
COPY package.json .

# libgs.so is in the multiarch folder of the image architecture (x86_64 or aarch64)
RUN GS4JS_HOME="/usr/lib/$(uname -m)-linux-gnu" npm install

# Copy the rest of the source code over
COPY . .

CMD [ "npm", "start" ]
