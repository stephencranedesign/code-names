FROM node:alpine as builder

WORKDIR /app
COPY client/package.json ./
RUN npm install
COPY . .

RUN ["npm", "run", "build"]

FROM node:alpine

WORKDIR /app
COPY server/package.json ./
RUN npm install
COPY . .
COPY --from=builder /app/build /public

CMD ["npm", "run", "start"]

