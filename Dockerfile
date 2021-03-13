FROM node:lts-alpine
WORKDIR /app

ENV TZ=Europe/Paris
RUN apk add --no-cache tzdata

COPY package*.json ./

RUN npm install

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]