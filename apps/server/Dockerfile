# Base image
FROM node:20-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
COPY ./package.json ./
COPY ./apps/server/package.json ./apps/server/
RUN npm install

COPY ./apps/server ./apps/server
WORKDIR /app/apps/server

# Generate prisma client
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app/apps/server

COPY --from=builder /app/package.json ../../
COPY --from=builder /app/node_modules ../../node_modules
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/prisma ./prisma

EXPOSE 3001
ENV PORT 3001
ENV NODE_ENV production

# Start server
CMD ["npm", "run", "start"]
