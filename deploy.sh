#!/bin/bash
# Se ejecuta EN EL SERVIDOR (cPanel) desde .cpanel.yml tras actualizar el clon de la rama deploy-*.
# Sustituye la web compilada sin tocar .htaccess, .well-known ni cgi-bin. (El servidor no tiene rsync.)
# Uso: deploy.sh <carpeta pública absoluta>
set -euo pipefail

DEST="$1"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "== Desplegando $(cat "$HERE/.deploy-info") en $DEST"
mkdir -p "$DEST"

# Copiar primero los archivos nuevos y después borrar los de la versión anterior,
# para que la web no se quede sin archivos durante el despliegue
cp -a "$HERE/site/." "$DEST/"
cd "$HERE/site"
find "$DEST" -mindepth 1 -maxdepth 1 ! -name '.*' ! -name cgi-bin | while read -r f; do
  name=$(basename "$f")
  [ -e "$name" ] || { echo "borrando $name"; rm -rf "$f"; }
done
# Dentro de assets y media, borrar también lo que ya no existe
for dir in assets media; do
  [ -d "$DEST/$dir" ] || continue
  (cd "$DEST/$dir" && find . -type f) | while read -r f; do
    [ -e "$dir/$f" ] || { echo "borrando $dir/${f#./}"; rm -f "$DEST/$dir/$f"; }
  done
done
echo "== Despliegue terminado"
