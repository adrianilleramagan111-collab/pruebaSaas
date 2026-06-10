#!/usr/bin/env sh
# Arranca Facturia en tu ordenador (Mac/Linux): ejecuta  sh iniciar.sh
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "Necesitas Node.js. Descárgalo gratis de https://nodejs.org/es"
  echo "e instálalo con todo por defecto. Luego vuelve a ejecutar: sh iniciar.sh"
  echo ""
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Instalando dependencias (solo la primera vez, 1-2 minutos)..."
  npm install || exit 1
fi

echo ""
echo "Arrancando Facturia en http://localhost:3000 (deja esta ventana abierta)"
echo ""
(
  sleep 8
  open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null
) &
npm run dev
