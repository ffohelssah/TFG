FROM node:20-bullseye AS build

# Install essential build tools
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# UPDATE NPM to latest version (has fix for lightningcss issue)
RUN npm install -g npm@latest

WORKDIR /app

# Copy package.json with optionalDependencies
COPY package.json ./

# Clean install
RUN rm -f package-lock.json
RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build with specific environment variables
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 