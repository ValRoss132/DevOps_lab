FROM node:20-alpine 

WORKDIR /app

COPY package.json ./

RUN npm install 

COPY . . 

RUN npm install -g nodemon typescript ts-node

CMD ["npm", "run", "dev"]