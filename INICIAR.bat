@echo off
REM Arranca Facturia en tu ordenador: doble click y listo.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Necesitas Node.js. Descargalo gratis de https://nodejs.org/es
  echo ^(boton verde, instalar con todo por defecto^) y vuelve a abrir este archivo.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias ^(solo la primera vez, 1-2 minutos^)...
  call npm install
)

echo.
echo Arrancando Facturia... cuando veas "Ready" abre http://localhost:3000
echo ^(se abrira solo en unos segundos; deja esta ventana abierta^)
echo.
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev
pause
