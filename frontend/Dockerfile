FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# El frontend compilado será servido por el backend
# Este contenedor solo se usa para compilar y es opcional en producción
EXPOSE 3000

CMD ["npm", "run", "preview"]
