@echo off
setlocal
set /p MOCKAPI_URL=Escribe URL base MockAPI (https://xxxx.mockapi.io): 
echo ATENCION: esta accion agrega 18 registros y no elimina registros anteriores.
choice /C SN /M "Confirmas que quieres agregar datos de practica"
if errorlevel 2 exit /b 0
node "%~dp0sembrar.mjs"
pause
