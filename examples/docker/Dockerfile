# Official Node.js 24 image based on Debian bookworm. Ghostscript is installed
# by npm from libgs, so the Ghostscript packages of Debian are not needed.
FROM node:24-bookworm

WORKDIR /src

# Only copy the package.json for now
# If it didn't change this will improve build time because node_modules can be cached
# https://christianfei.com/posts/Cache-speed-up-docker-node-modules/
COPY package.json .

RUN npm install

# Copy the rest of the source code over
COPY . .

CMD [ "npm", "start" ]
