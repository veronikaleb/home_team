@echo off
title Home Team CRM Loader
echo [1/2] Zapusk servera Node.js...
start /min cmd /c "node server.js"
echo [2/2] Vidkryttia CRM...
timeout /t 2 >nul
start "" "index.html"
exit