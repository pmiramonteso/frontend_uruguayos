import { NavigationError } from '@angular/router';

import { recargarSiFaltaUnChunk } from './recarga-tras-despliegue';

describe('recargarSiFaltaUnChunk', () => {
  let assign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.removeItem('recarga-tras-despliegue');
    assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
  });

  afterEach(() => vi.unstubAllGlobals());

  const error = (mensaje: string, url = '/mapa') =>
    new NavigationError(1, url, new TypeError(mensaje));

  it('recarga la página de destino si falta un chunk', () => {
    recargarSiFaltaUnChunk(error('Failed to fetch dynamically imported module: https://x/chunk-ABC.js'));
    expect(assign).toHaveBeenCalledWith('/mapa');
  });

  it('solo lo intenta una vez por página', () => {
    recargarSiFaltaUnChunk(error('Failed to fetch dynamically imported module'));
    recargarSiFaltaUnChunk(error('Failed to fetch dynamically imported module'));
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it('no hace nada con otros errores', () => {
    recargarSiFaltaUnChunk(error('Cannot read properties of undefined'));
    expect(assign).not.toHaveBeenCalled();
  });
});
