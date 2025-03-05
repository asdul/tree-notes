# Pull the new image
docker-compose pull

# Restart the container with the new version
docker-compose down
docker-compose up -d