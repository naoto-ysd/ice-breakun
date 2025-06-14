FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --cache-folder .yarn/cache

FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn/cache ./.yarn/cache
COPY . .
EXPOSE 3000
CMD ["yarn", "dev", "--host"]
