# Use the official Node.js image as base
FROM node:latest

# Set the working directory in the container
WORKDIR /Users/manmithakrishnachelluboyina/Coding/NodeJs/fillout-assignment-manmitha

# Copy package.json and package-lock.json if available
COPY package*.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript files
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD [ "node", "dist/app.js" ]
