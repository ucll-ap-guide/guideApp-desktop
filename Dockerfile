FROM node:latest as build

WORKDIR /usr/local/app
COPY . /usr/local/app/
RUN npm install
RUN npm run build

FROM nginx:latest

EXPOSE 80
COPY --from=build /usr/local/app/dist /usr/share/nginx/html
