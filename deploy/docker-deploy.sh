#!/bin/bash

# Docker deployment script for Spiritual Condition Tracker

# Ensure we're in the correct directory
cd "$(dirname "$0")/.."

echo "Starting Docker deployment of Spiritual Condition Tracker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t spiritual-condition-tracker -f deploy/Dockerfile .

# Stop and remove any existing containers
echo "Cleaning up existing containers..."
docker stop spiritual-condition-tracker 2>/dev/null || true
docker rm spiritual-condition-tracker 2>/dev/null || true

# Run the container using Docker Compose
echo "Starting container with Docker Compose..."
cd deploy
docker-compose up -d

echo "Deployment complete!"
echo "Your application is now running at: http://localhost:3000"
echo "To check container status, run: docker ps"
echo "To view logs, run: docker logs spiritual-condition-tracker"