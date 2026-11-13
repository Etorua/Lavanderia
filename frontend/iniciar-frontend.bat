@echo off
title POS Frontend (Vite Puerto 3000)
echo ====================================================
echo  Iniciando Servidor Web POS en http://localhost:3000
echo ====================================================
cd /d "%~dp0"

if not exist "node_modules\" (
    echo Instalando paquetes npm...
    call npm install
)

echo Levantando servidor de desarrollo...
call npm run dev
pause
