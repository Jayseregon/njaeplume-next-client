# Use the node:22-alpine image as the base
FROM node:22-alpine3.20 AS base

# Install libc6-compat which might be needed according to Node.js Docker best practices
RUN apk add --no-cache libc6-compat

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install all dependencies (including 'devDependencies' for development purposes)
RUN npm install

# For production, consider installing only production dependencies
FROM base AS production-dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy the application source code excluding node_modules
COPY . .

# Build the Next.js application
RUN npm run build

# Development image, copy all the files and prepare for running the app
FROM base AS dev
WORKDIR /app

# Set environment variables
# ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
	adduser --system --uid 1001 nextjs

# Copy the build output to the dev stage, excluding node_modules as it will be mounted
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Set the correct permissions for the Next.js application
RUN chown -R nextjs:nodejs .next
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["node", "node_modules/next/dist/bin/next", "start"]
