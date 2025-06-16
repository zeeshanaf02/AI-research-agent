# Start the backend and frontend servers

# Start the backend server
Start-Process -FilePath "powershell" -ArgumentList "-Command cd $PSScriptRoot/backend; python run.py"

# Wait a moment for the backend to start
Start-Sleep -Seconds 2

# Start the frontend server
Start-Process -FilePath "powershell" -ArgumentList "-Command cd $PSScriptRoot/frontend; npm start"

Write-Host "Research Assistant is starting..."
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"