FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Instala dependencias primero (así Docker las cachea si no cambian)
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el resto del código
COPY . .

# No correr como administrador (root) dentro del contenedor
USER node

EXPOSE 3002

CMD ["node", "index.js"]
