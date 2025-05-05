FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV EXPO_PORT=5001
ENV CI=1

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "deployment-server.js"]