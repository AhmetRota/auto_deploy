FROM node:12-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install --no-cache
COPY --chown=node:node . .

RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY 99tmdetgs3end82
ENV PM2_SECRET_KEY 6w71tvew8hemarb
USER node
CMD ["pm2-runtime", "app.js"]