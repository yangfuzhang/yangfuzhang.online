FROM node:21.0-alpine3.18
WORKDIR /app
COPY . .
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD node ./dist/server/entry.mjs