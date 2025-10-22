FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3003

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/cli

COPY . .

RUN npm run build

# Generate Prisma Client
RUN npx prisma generate

# Copy and set execution permission for startup script
COPY docker-start.sh /app/docker-start.sh
RUN chmod +x /app/docker-start.sh

CMD ["/app/docker-start.sh"]
