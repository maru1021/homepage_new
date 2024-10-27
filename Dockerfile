# Use the official Node.js image
FROM node:16

# Set the working directory in the container
WORKDIR /homepage/react-app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY react-app/package*.json ./

# Install dependencies including prop-types
RUN npm install

# Copy the rest of the app files
COPY react-app .

# Expose the port the app runs on
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
