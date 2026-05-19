@echo off
echo === SportSpot Instalacija ===

cd /d "%~dp0backend"
call npm install --no-audit

cd /d "%~dp0frontend"
call npm install --no-audit
call npm run build

echo Instalacija zavrsena.
pause