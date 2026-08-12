# Dockerfile for the server

FROM node:18-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json* ./
RUN npm install --production
COPY server ./server
COPY ./.gitignore ./
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]
