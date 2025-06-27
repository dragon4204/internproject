#!/bin/bash

echo "Starting 3D Model Viewer Application..."
echo

echo "Installing backend dependencies..."
cd backend
npm install

echo
echo "Starting the server..."
echo "The application will be available at http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo

npm start 

cd backend
copy env.example .env 

# Windows
start.bat

# Unix/Mac
chmod +x start.sh
./start.sh 