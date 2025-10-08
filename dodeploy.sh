#!/bin/bash
# Set execution permission explicitly
chmod +x health-index-frontend/node_modules/.bin/vite

# Run the frontend install and build
cd health-index-frontend
npm install --unsafe-perm
npm run build

# Exit script
exit $?
