@echo off
setlocal
set /p MOCKAPI_URL=Escribe URL base MockAPI (https://xxxx.mockapi.io): 
node "%~dp0verificar-api.mjs"
pause
