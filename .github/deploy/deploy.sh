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

# Redirecciones http -> https y www -> sin www, en un bloque propio al principio del .htaccess.
# El resto del .htaccess (reglas de la SPA, configuración del backend en Passenger) no se toca.
# Se excluye .well-known para que la renovación del certificado SSL siga funcionando.
HT="$DEST/.htaccess"
INICIO='# BEGIN redirecciones-https-sin-www'
FIN='# END redirecciones-https-sin-www'
touch "$HT"
cp -p "$HT" "$HT.antes-del-despliegue"
{
  echo "$INICIO (lo gestiona deploy.sh desde GitHub: no editar a mano)"
  echo 'RewriteEngine On'
  echo 'RewriteCond %{REQUEST_URI} !^/\.well-known/'
  echo 'RewriteCond %{HTTPS} off [OR]'
  echo 'RewriteCond %{HTTP_HOST} ^www\. [NC]'
  echo 'RewriteCond %{HTTP_HOST} ^(?:www\.)?(.+)$ [NC]'
  echo 'RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]'
  echo "$FIN"
  echo
  # Quitar el bloque de despliegues anteriores (y las líneas en blanco que deja delante)
  sed "/^$INICIO/,/^$FIN/d" "$HT.antes-del-despliegue" | sed '/./,$!d'
} > "$HT.nuevo"
mv "$HT.nuevo" "$HT"
echo "== .htaccess: bloque de redirecciones al principio ($(wc -l < "$HT") líneas; copia anterior en .htaccess.antes-del-despliegue)"

echo "== Despliegue terminado"
