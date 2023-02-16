FROM node:18-alpine3.17 as build

COPY frontend /app
WORKDIR /app

RUN npm install && npm run build

FROM nginx:stable-alpine as frontend

COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
