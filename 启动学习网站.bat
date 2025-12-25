@echo off
echo Starting...

start /min cmd /c "cd /d %~dp0server && npm start"
timeout /t 2 /nobreak >nul
start /min cmd /c "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo Done! Press any key to close.
pause >nul
