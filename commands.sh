# Build the new Docker image
docker build -t aabsb1010/tree-notes:1.0.2 .

# Push the new version to Docker Hub
docker push aabsb1010/tree-notes:1.0.2

# Tag and push as latest
docker tag aabsb1010/tree-notes:1.0.2 aabsb1010/tree-notes:latest
docker push aabsb1010/tree-notes:latest