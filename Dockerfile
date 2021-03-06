FROM node:12.13.1-buster-slim AS build-react-app

RUN mkdir /app

WORKDIR /app

COPY client .

RUN npm install --only=prod

RUN npm run build


FROM node:12.13.1-buster-slim

RUN mkdir /app /ui

COPY --from=build-react-app /app/build /ui

WORKDIR /app

COPY server .

RUN npm install --only=prod

ENV SAURON_ENV=cluster
ENV SAURON_UI_BUILD=/ui
EXPOSE 1729

CMD [ "node", "index.js" ]
