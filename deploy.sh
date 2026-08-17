#!/bin/bash
set -e

APP_DIR="/var/www/puntonorte"
APP_NAME="puntonorte"

echo "🚀 Iniciando deploy..."

cd $APP_DIR

# 1. Bajar cambios
echo "📥 Bajando código de GitHub..."
git checkout -- package-lock.json 2>/dev/null || true
git pull origin main

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

# 3. Build — si falla, NO reiniciamos PM2 (la tienda sigue con la versión anterior)
echo "🔨 Construyendo aplicación..."
if npm run build; then
    echo "✅ Build exitoso"
    # 4. Reiniciar solo si el build fue exitoso
    pm2 restart $APP_NAME
    echo "🟢 Deploy completado exitosamente"
else
    echo "❌ Build falló — la tienda sigue corriendo con la versión anterior"
    echo "❌ Revisa los errores arriba y corrige antes de volver a intentar"
    exit 1
fi
