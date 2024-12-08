# Requirement: Frontend Containerization
# Location: Technical Specification/Development & Deployment/Deployment Architecture
# Description: Ensures the React-based frontend application is containerized for deployment in a Kubernetes environment.

# Use Node.js 20-alpine as the base image for a lightweight and secure container
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies using npm
# Note: Using npm ci for clean installs in production builds
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the application using Vite
RUN npm run build

# Expose port 3000 for the application
EXPOSE 3000

# Set the default command to start the application in preview mode
CMD ["npm", "run", "preview"]

# Human Tasks:
# 1. Verify that the REACT_APP_API_BASE_URL environment variable is set in your deployment environment
# 2. Ensure all required environment variables from .env.example are configured in your deployment
# 3. Review the npm ci installation step for any specific package requirements
# 4. Validate the exposed port matches your deployment configuration
# 5. Test the container build process in your CI/CD pipeline