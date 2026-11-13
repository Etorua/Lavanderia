@echo off
echo ===================================================================
echo     LANZADOR DEL SISTEMA INTEGRAL POS, INVENTARIO Y GOBERNANZA
echo ===================================================================
echo.
echo Levantando Backend API en el puerto 4000...
start "POS Backend API (Puerto 4000)" cmd /k "cd /d %~dp0backend && iniciar-backend.bat"

echo Levantando Frontend Web en el puerto 3000...
start "POS Frontend Web (Puerto 3000)" cmd /k "cd /d %~dp0frontend && iniciar-frontend.bat"

echo.
echo ===================================================================
echo  Los servidores se estan iniciando en terminales separadas:
echo   - Backend API: http://localhost:4000/api/v1
echo   - Frontend Web: http://localhost:3000
echo ===================================================================
timeout /t 5

