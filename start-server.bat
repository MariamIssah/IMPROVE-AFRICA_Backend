@echo off
echo IMPROVE AFRICA Marketplace Server Launcher
echo =========================================
echo.

set /p EMAIL_PASSWORD=Enter Gmail App Password for improveafrica01@gmail.com: 

echo.
echo Starting server with your email password...
echo.

node server.js

pause 