FROM node:22.14.0-alpine3.20

WORKDIR /build

COPY package*.json .

RUN npm install --omit=dev
RUN npm cache clean --force

RUN mkdir /build/logs
RUN mkdir /logs

COPY . .

CMD ["node", "app.js"]