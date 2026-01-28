FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

# Install dependencies if package-lock is present or just install
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
