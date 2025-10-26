# Simple Dockerfile for PetPet Next.js Application (Development Mode)
# Cross-platform: ARM64 (M4 Mac) to AMD64 (Linux servers)

FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV FORCE_DEV=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose port
EXPOSE 3000

# Start the development server (like running locally)
CMD ["npm", "run", "dev"]

