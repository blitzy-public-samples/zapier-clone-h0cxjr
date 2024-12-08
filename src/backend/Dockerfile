# Addresses requirement: Containerization - Provides a Dockerfile to containerize the backend application for consistent deployment across environments.
# Technical Specification/Development & Deployment/Deployment Architecture

# Use official Node.js 20 LTS Alpine image as base
# Node.js v20 LTS
FROM node:20-alpine

# Human Tasks:
# 1. Ensure proper security scanning of base image is configured in CI/CD pipeline
# 2. Review and adjust container resource limits based on production requirements
# 3. Configure proper logging driver settings for container logs
# 4. Verify proper user permissions and security context settings

# Set working directory
WORKDIR /usr/src/app

# Copy package files for dependency installation
# Technical Specification/Development & Deployment/Programming Languages
# Ensures all dependencies are installed and configured within the container
COPY package.json package-lock.json ./

# Install dependencies
# npm v8+
RUN npm install

# Copy application source code
COPY . .

# Build TypeScript code
# Technical Specification/Development & Deployment/Programming Languages
RUN npm run build

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Expose port for the backend application
EXPOSE 3000

# Start the backend server
# Technical Specification/System Design/Deployment Architecture
# Configures the container to initialize and run the backend application
CMD ["npm", "start"]