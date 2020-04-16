FROM node:alpine as ui-builder
WORKDIR /app

COPY ui/package.json .
RUN npm install
COPY ./ui .

RUN npm run build

####

FROM node:alpine as server-builder
WORKDIR /app

COPY ./server/package.json .
RUN npm install
COPY ./server .

COPY ./ui/src/constants ./constants
RUN npm run copy-constants

####

FROM node:alpine
WORKDIR /app

COPY --from=server-builder /app .
COPY --from=ui-builder /app/build ./build

EXPOSE 80:3001
EXPOSE 81:8081

CMD ["npm", "run", "start"]
