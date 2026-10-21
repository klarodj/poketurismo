FROM node:24-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY server/package.json server/package-lock.json ./server/
RUN npm --prefix server ci
COPY . .
ENV DATABASE_URL=file:/data/game.db
RUN npm --prefix server run generate
RUN DATABASE_URL=postgresql://build@localhost/build npm --prefix server run generate:postgres
RUN VITE_API_BASE_URL=/api npm run build
RUN npm --prefix server prune --omit=dev

FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts/database.py ./scripts/database.py
COPY --from=build /app/scripts/container-start.sh ./scripts/container-start.sh
ENV NODE_ENV=production PORT=3001 DATABASE_URL=file:/data/game.db
EXPOSE 3001
CMD ["bash", "scripts/container-start.sh"]
