FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Build for production
RUN npm run build

# Expose the port (Railway will map this)
EXPOSE 4173

# Start the preview server
CMD ["npm", "run", "preview"]
