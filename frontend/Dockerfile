FROM node:20-alpine

ARG BACKEND_URL=http://investment-backend:8000
ENV BACKEND_URL=$BACKEND_URL

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]