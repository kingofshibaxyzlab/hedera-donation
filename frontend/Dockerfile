# Example Next.js Dockerfile with increased heap size
FROM node:20-slim

WORKDIR /app

# Copy project files
COPY . /app/
COPY env_deploy/test_env.ts /app/src/env.ts

# Install dependencies
RUN npm install --legacy-peer-deps

# Set Node.js memory allocation to 4GB for the build process
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "deploy"]
