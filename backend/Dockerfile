FROM node:16-slim

WORKDIR /app

COPY package*.json ./

# Instalar dependencias
RUN npm install

COPY . .

RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"] 