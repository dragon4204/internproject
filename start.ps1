Write-Host "Starting 3D Model Viewer Application..." -ForegroundColor Green
Write-Host ""

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install

Write-Host ""
Write-Host "Creating environment file if it doesn't exist..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Write-Host "Environment file created. Please edit .env with your MongoDB connection string." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Starting the server..." -ForegroundColor Green
Write-Host "The application will be available at http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start 