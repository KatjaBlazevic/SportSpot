@echo off
echo Pokretanje SportSpot sustava...
start "Backend API" cmd /k "cd backend && npx ts-node --esm src/index.ts"
start "Frontend" cmd /k "cd frontend && npx serve dist -p 3000"
echo Backend API dostupan na http://localhost:5000
echo Frontend dostupan na http://localhost:3000
pause