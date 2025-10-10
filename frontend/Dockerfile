# Stage 1: Build Angular app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve built app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf   <-- remove or comment this line
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
