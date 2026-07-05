FROM node:22-slim

WORKDIR /app/backend

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend ./ 
COPY frontend /app/frontend

EXPOSE 3000

CMD ["npm", "start"]
