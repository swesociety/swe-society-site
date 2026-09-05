# Use an official Node.js image as the base
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the desired port (e.g., 3000)
EXPOSE 5050

# Start the application in production mode
# CMD ["npm", "run", "dev"]
CMD ["npm", "start"]


#sudo docker build -t society-site .
# docker run -p 5050:5050 --env-file .env society-site