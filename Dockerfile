FROM node:lts-alpine
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]