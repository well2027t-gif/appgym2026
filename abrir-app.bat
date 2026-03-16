@echo off
cd /d "%~dp0"

echo Iniciando servidor do app (npm run dev)...
echo.

REM Abre o servidor em uma nova janela do terminal
start "tai-strong-app-dev" cmd /k "npm run dev"

REM Espera alguns segundos para o servidor subir
timeout /t 5 /nobreak >nul

REM Abre o navegador na URL padrão do Vite
start "" "http://localhost:5173/"

echo.
echo App sendo executado em http://localhost:5173/
echo Voce pode fechar esta janela.
exit /b 0

