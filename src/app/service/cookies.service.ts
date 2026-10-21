import { Injectable, signal } from '@angular/core';

export type Consentimiento = 'aceptado' | 'rechazado';

const CLAVE = 'cookies-consentimiento';
// La elección caduca a los 12 meses y se vuelve a preguntar (la AEPD recomienda 24 como máximo).
// index.html usa el mismo formato y plazo: si se cambia aquí, cambiarlo también allí.
export const VALIDEZ_MS = 365 * 24 * 60 * 60 * 1000;

// gtag lo define el script de Consent Mode de index.html
declare const gtag: ((...args: unknown[]) => void) | undefined;

@Injectable({
  providedIn: 'root'
})
export class CookiesService {
  consentimiento = signal<Consentimiento | null>(this.leer());
  mostrarBanner = signal(this.consentimiento() === null);

  aceptar(): void {
    this.guardar('aceptado');
  }

  rechazar(): void {
    this.guardar('rechazado');
  }

  // Vuelve a mostrar el banner para cambiar la elección (enlace "Configurar cookies")
  configurar(): void {
    this.mostrarBanner.set(true);
  }

  private guardar(valor: Consentimiento): void {
    this.consentimiento.set(valor);
    this.mostrarBanner.set(false);
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ valor, fecha: Date.now() }));
    } catch {}

    // Solo analítica: la publicidad (ad_*) sigue denegada porque la web no la usa
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: valor === 'aceptado' ? 'granted' : 'denied'
      });
    }

    // Al retirar el consentimiento, borrar las cookies de Google Analytics que ya existan
    if (valor === 'rechazado') {
      this.borrarCookiesAnalytics();
    }
  }

  private leer(): Consentimiento | null {
    try {
      const { valor, fecha } = JSON.parse(localStorage.getItem(CLAVE) ?? 'null') ?? {};
      if (valor !== 'aceptado' && valor !== 'rechazado') return null;
      if (typeof fecha !== 'number' || Date.now() - fecha > VALIDEZ_MS) return null;
      return valor;
    } catch {
      return null;
    }
  }

  private borrarCookiesAnalytics(): void {
    const dominio = location.hostname.replace(/^www\./, '');
    document.cookie.split(';')
      .map(c => c.split('=')[0].trim())
      .filter(nombre => nombre === '_ga' || nombre.startsWith('_ga_') || nombre === '_gid')
      .forEach(nombre => {
        for (const d of [dominio, '.' + dominio, '']) {
          document.cookie = `${nombre}=; Max-Age=0; path=/${d ? '; domain=' + d : ''}`;
        }
      });
  }
}
