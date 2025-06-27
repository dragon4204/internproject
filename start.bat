@echo off
echo Starting 3D Model Viewer Application...
echo.

echo Installing backend dependencies...
cd backend
call npm install

echo.
echo Creating environment file if it doesn't exist...
if not exist .env (
    copy env.example .env
    echo Environment file created. Please edit .env with your MongoDB connection string.
)

echo.
echo Starting the server...
echo The application will be available at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

npm start 