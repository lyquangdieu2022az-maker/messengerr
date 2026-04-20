@echo off
setlocal
cd /d "%~dp0"
set "PATH=%~dp0tools\node;%PATH%"
".\tools\node\npm.cmd" start
