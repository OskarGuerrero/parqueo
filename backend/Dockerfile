FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del frontend y compilar
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend

COPY frontend ./frontend/
RUN npm run build --prefix frontend

# Instalar dependencias del backend
COPY backend/package*.json ./backend/
RUN npm install --prefix backend

# Copiar código del backend
COPY backend/server.js ./backend/

EXPOSE 5000

CMD ["node", "backend/server.js"]
