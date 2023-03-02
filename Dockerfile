FROM node:18-alpine3.17 as development

WORKDIR /app

COPY frontend/package*.json /app/
RUN npm install

CMD ["npm", "run", "dev"]

FROM node:18-alpine3.17 as build

COPY frontend /app
COPY --from=development /app/node_modules /app/node_modules

WORKDIR /app

RUN npm run build

FROM nginx:stable-alpine as production

COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
