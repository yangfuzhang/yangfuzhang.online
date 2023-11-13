FROM node:20.0-alpine3.17
WORKDIR /src
COPY package.json .
RUN npm config set registry https://registry.npm.taobao.org/
RUN npm install
COPY . ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]