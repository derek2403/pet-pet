#!/bin/bash
# Docker Deployment Script for PetPet
# Builds and pushes to DockerHub for AMD64 Linux

set -e  # Exit on error

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-your-dockerhub-username}"
IMAGE_NAME="petpet"
VERSION="${VERSION:-latest}"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
PLATFORM="linux/amd64"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐾 PetPet Docker Deployment Script${NC}"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Setup buildx for cross-platform builds (M4 Mac -> AMD64 Linux)
echo -e "${GREEN}Setting up Docker buildx for cross-platform build...${NC}"
docker buildx create --name petpet-builder --use 2>/dev/null || docker buildx use petpet-builder 2>/dev/null || true
docker buildx inspect --bootstrap

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️  Not logged in to Docker Hub${NC}"
    echo "Please run: docker login"
    exit 1
fi

echo -e "${GREEN}Step 1/5: Building Docker image for ${PLATFORM}...${NC}"
echo "Building from ARM64 (M4 Mac) for AMD64 (Linux servers)..."
docker buildx build \
    --platform ${PLATFORM} \
    --tag ${FULL_IMAGE_NAME} \
    --tag ${DOCKER_USERNAME}/${IMAGE_NAME}:latest \
    --load \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 2/5: Testing image locally...${NC}"
docker run --rm -d \
    --name petpet-test \
    -p 3001:3000 \
    ${FULL_IMAGE_NAME}

sleep 5

# Test health check
if curl -f http://localhost:3001/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Container is running correctly!${NC}"
    docker stop petpet-test
else
    echo -e "${RED}❌ Container health check failed!${NC}"
    docker stop petpet-test
    exit 1
fi

echo ""
echo -e "${GREEN}Step 3/5: Checking image size...${NC}"
IMAGE_SIZE=$(docker images ${FULL_IMAGE_NAME} --format "{{.Size}}")
echo "Image size: ${IMAGE_SIZE}"

echo ""
echo -e "${GREEN}Step 4/5: Pushing to Docker Hub...${NC}"
echo "Pushing: ${FULL_IMAGE_NAME}"
docker push ${FULL_IMAGE_NAME}

if [ "${VERSION}" != "latest" ]; then
    echo "Pushing: ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Push successful!${NC}"
else
    echo -e "${RED}❌ Push failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 5/5: Deployment complete! 🎉${NC}"
echo "=================================="
echo ""
echo "📦 Docker Hub URL:"
echo "   https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"
echo ""
echo "🚀 To pull and run on any AMD64 Linux machine:"
echo "   docker pull ${FULL_IMAGE_NAME}"
echo "   docker run -d -p 3000:3000 --name petpet ${FULL_IMAGE_NAME}"
echo ""
echo "🐳 Or use docker-compose:"
echo "   docker-compose up -d"
echo ""
echo -e "${GREEN}✅ All done!${NC}"

