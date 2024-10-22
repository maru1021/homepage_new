# Use the official Node.js image
FROM node:16

# Set the working directory in the container
WORKDIR /homepage/react-app

# Copy only the react-app folder from the host to the container
COPY react-app /homepage/react-app

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
