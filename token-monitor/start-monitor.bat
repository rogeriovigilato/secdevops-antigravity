@echo off
set PATH=E:\nodejs;%PATH%
cd /d E:\antigravity-kit\token-monitor
start "" "http://127.0.0.1:4317"
E:\nodejs\node.exe src\server.js
