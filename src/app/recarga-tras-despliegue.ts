import { NavigationError } from '@angular/router';

// Con la carga por partes, una pestaña abierta antes de un despliegue pide trozos de código
// (chunk-*.js) que el despliegue ya ha borrado. En ese caso se carga la página de destino
// entera, que trae la versión nueva. Solo una vez por página, para no entrar en un bucle.
const CHUNK_NO_ENCONTRADO = /dynamically imported module|Importing a module script failed|ChunkLoadError/i;
const CLAVE = 'recarga-tras-despliegue';

export function recargarSiFaltaUnChunk(error: NavigationError): void {
  if (!CHUNK_NO_ENCONTRADO.test(String(error.error?.message ?? error.error))) return;
  try {
    if (sessionStorage.getItem(CLAVE) === error.url) return;
    sessionStorage.setItem(CLAVE, error.url);
  } catch {}
  location.assign(error.url);
}
