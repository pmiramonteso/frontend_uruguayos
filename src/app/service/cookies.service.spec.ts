import { TestBed } from '@angular/core/testing';

import { CookiesService, VALIDEZ_MS } from './cookies.service';

describe('CookiesService', () => {
  let service: CookiesService;

  beforeEach(() => {
    localStorage.removeItem('cookies-consentimiento');
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookiesService);
  });

  it('muestra el banner si todavía no se ha elegido', () => {
    expect(service.consentimiento()).toBeNull();
    expect(service.mostrarBanner()).toBe(true);
  });

  it('guarda la elección y oculta el banner', () => {
    service.aceptar();
    expect(JSON.parse(localStorage.getItem('cookies-consentimiento')!).valor).toBe('aceptado');
    expect(service.mostrarBanner()).toBe(false);

    service.rechazar();
    expect(JSON.parse(localStorage.getItem('cookies-consentimiento')!).valor).toBe('rechazado');
  });

  it('recuerda una elección reciente', () => {
    localStorage.setItem('cookies-consentimiento', JSON.stringify({ valor: 'aceptado', fecha: Date.now() }));
    const nuevo = TestBed.runInInjectionContext(() => new CookiesService());
    expect(nuevo.consentimiento()).toBe('aceptado');
    expect(nuevo.mostrarBanner()).toBe(false);
  });

  it('vuelve a preguntar cuando la elección ha caducado', () => {
    const haceMasDeUnAnio = Date.now() - VALIDEZ_MS - 1000;
    localStorage.setItem('cookies-consentimiento', JSON.stringify({ valor: 'aceptado', fecha: haceMasDeUnAnio }));
    const nuevo = TestBed.runInInjectionContext(() => new CookiesService());
    expect(nuevo.consentimiento()).toBeNull();
    expect(nuevo.mostrarBanner()).toBe(true);
  });

  it('configurar vuelve a mostrar el banner', () => {
    service.rechazar();
    service.configurar();
    expect(service.mostrarBanner()).toBe(true);
  });
});
