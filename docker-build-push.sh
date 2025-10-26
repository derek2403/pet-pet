#!/bin/bash
# Simplified Docker build and push for M4 Mac -> AMD64 Linux
# This script builds AMD64 images from ARM64 Mac and pushes directly to DockerHub

set -e

# Configuration
DOCKER_USERNAME="${1:-derek2403}"
IMAGE_NAME="petpet"
VERSION="${2:-latest}"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🐾 Building AMD64 image from M4 Mac...${NC}"
echo "Username: ${DOCKER_USERNAME}"
echo "Image: ${FULL_IMAGE_NAME}"
echo ""

# Check Docker login
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Please login first:${NC}"
    docker login
fi

# Setup buildx builder
echo "Setting up buildx..."
docker buildx create --name petpet-builder --use 2>/dev/null || docker buildx use petpet-builder 2>/dev/null || true
docker buildx inspect --bootstrap

# Build and push in one command (more efficient)
echo ""
echo -e "${GREEN}Building and pushing to DockerHub...${NC}"
docker buildx build \
    --platform linux/amd64 \
    --tag ${FULL_IMAGE_NAME} \
    --tag ${DOCKER_USERNAME}/${IMAGE_NAME}:latest \
    --push \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to DockerHub!${NC}"
    echo ""
    echo "📦 Pull and run on any AMD64 Linux server:"
    echo "   docker pull ${FULL_IMAGE_NAME}"
    echo "   docker run -d -p 3000:3000 ${FULL_IMAGE_NAME}"
else
    echo -e "${RED}❌ Build/push failed!${NC}"
    exit 1
fi

