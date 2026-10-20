#!/bin/bash
# Se ejecuta EN GITHUB ACTIONS. Pide al cPanel (API con token) que actualice el clon
# de la rama deploy-* y lance su .cpanel.yml. Espera al resultado y muestra el log.
# Variables: CPANEL_HOST, CPANEL_USER, CPANEL_TOKEN, REPO_ROOT, BRANCH
set -euo pipefail

API="https://${CPANEL_HOST}:2083/execute"
AUTH="Authorization: cpanel ${CPANEL_USER}:${CPANEL_TOKEN}"

uapi() {
  local fn="$1"; shift
  local args=()
  for kv in "$@"; do args+=(--data-urlencode "$kv"); done
  curl -sS --fail --get -H "$AUTH" "${args[@]}" "$API/$fn"
}

ok() { jq -e '.status == 1' >/dev/null <<<"$1" || { echo "Error de la API de cPanel:"; jq '.errors' <<<"$1"; exit 1; }; }

echo "== Actualizando $REPO_ROOT a la rama $BRANCH"
r=$(uapi VersionControl/update "repository_root=$REPO_ROOT" "branch=$BRANCH"); ok "$r"
jq -r '.data.last_update.identifier + "  " + .data.last_update.message' <<<"$r"

echo "== Lanzando el despliegue"
r=$(uapi VersionControlDeployment/create "repository_root=$REPO_ROOT"); ok "$r"
id=$(jq -r '.data.deploy_id' <<<"$r")

for _ in $(seq 1 90); do
  sleep 5
  d=$(uapi VersionControlDeployment/retrieve | jq --argjson id "$id" '.data[] | select(.deploy_id == $id)')
  if [ "$(jq -r '.timestamps.succeeded // empty' <<<"$d")" ] || [ "$(jq -r '.timestamps.failed // empty' <<<"$d")" ]; then break; fi
done

log=$(jq -r '.log_path' <<<"$d")
echo "== Log del despliegue ($log)"
uapi Fileman/get_file_content "dir=$(dirname "$log")" "file=$(basename "$log")" | jq -r '.data.content // empty'

if [ -z "$(jq -r '.timestamps.succeeded // empty' <<<"$d")" ]; then
  echo "El despliegue ha fallado o no terminó a tiempo"; exit 1
fi
echo "== Despliegue correcto"
