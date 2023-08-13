# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the Angular CLI and the application's dependencies
RUN npm install -g @angular/cli && npm install

# Copy the rest of the application code to the container
COPY . .

# Build the Angular application
RUN ng build

# Use an Nginx image to serve the built application
FROM nginx:1.19

# Copy the built application files to the Nginx container
COPY --from=0 /app/dist/my-app /usr/share/nginx/html

# Expose port 80 to allow access to the application
EXPOSE 80

# Start Nginx when the container is run
CMD ["nginx", "-g", "daemon off;"]
