FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server/package*.json ./server/
RUN npm install --prefix server

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "server/server.js"]
