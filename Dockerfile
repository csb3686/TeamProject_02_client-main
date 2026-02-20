FROM node:20 AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
# CMD ["npm", "start"]
RUN npm run build

FROM nginx:1.27-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]