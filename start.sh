#!/bin/sh
# Script de inicio para Railway
set -e

echo "=== Iniciando Sistema de Parqueo ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# Construir frontend
echo "📦 Compilando frontend..."
cd frontend

echo "Instalando dependencias..."
npm install

echo "Ejecutando build..."
if npm run build 2>&1; then
  echo "✓ Frontend compilado exitosamente"
  if [ -d "dist" ]; then
    echo "✓ Carpeta dist encontrada"
    ls -la dist/
  else
    echo "❌ ERROR: Carpeta dist no encontrada después del build"
    echo "Contenido de frontend:"
    ls -la
    exit 1
  fi
else
  echo "❌ ERROR: Fallo la compilación del frontend"
  exit 1
fi

cd ..
echo ""

# Iniciar backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

echo ""
echo "🚀 Iniciando servidor..."
npm run start
