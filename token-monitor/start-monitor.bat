@echo off
if exist "E:\nodejs\node.exe" set "PATH=E:\nodejs;%PATH%"
cd /d "%~dp0"
start "" "http://127.0.0.1:4317"
node src\server.js
