@echo off
echo ====================================================
echo  Iniciando Sistema POS Backend (Node.js + Prisma)
echo ====================================================
cd /d "%~dp0"

echo [1/3] Verificando dependencias npm...
if not exist "node_modules\" (
    echo Instalando paquetes npm...
    call npm install
)

echo [2/3] Generando Prisma Client y aplicando migraciones...
call npx prisma generate

echo [3/3] Iniciando servidor de desarrollo en http://localhost:4000 ...
call npm run dev
pause

