FROM node:20.0-alpine3.17
WORKDIR /app
COPY . .
RUN npm config set registry https://registry.npm.taobao.org/
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD node ./dist/server/entry.mjs