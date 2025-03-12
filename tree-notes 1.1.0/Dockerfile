FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create data directory
RUN mkdir -p data

# Expose port 3011
EXPOSE 3011

# Start the app
CMD [ "node", "server.js" ]