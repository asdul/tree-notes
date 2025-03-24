FROM node:18

# Set version as build argument
ARG VERSION=1.1.4

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Update version in package.json
RUN npm version ${VERSION} --no-git-tag-version

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Update version in HTML file
RUN sed -i "s/<div class=\"version-info\">v[0-9.]*<\/div>/<div class=\"version-info\">v${VERSION}<\/div>/" index.html

# Create data directory
RUN mkdir -p data

# Expose port 3011
EXPOSE 3011

# Start the app
CMD [ "node", "server.js" ]
