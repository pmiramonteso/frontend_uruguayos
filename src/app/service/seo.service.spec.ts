import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
  });

  it('pone título, descripción, Open Graph y canonical de la página', () => {
    service.setPagina('Noticias', 'Las últimas noticias');

    expect(TestBed.inject(Title).getTitle()).toBe('Noticias | Uruguayos en España');
    expect(meta.getTag('name="description"')?.content).toBe('Las últimas noticias');
    expect(meta.getTag('property="og:title"')?.content).toBe('Noticias | Uruguayos en España');
    expect(meta.getTag('name="robots"')?.content).toBe('index, follow');
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    expect(canonical?.href).toMatch(/^https:\/\/uruguayosenespanya\.com\//);
  });

  it('sin título usa el nombre del sitio y la descripción por defecto', () => {
    service.setPagina(undefined);
    expect(TestBed.inject(Title).getTitle()).toBe('Uruguayos en España');
    expect(meta.getTag('name="description"')?.content).toContain('Comunidad de uruguayos en España');
  });

  it('marca como noindex las páginas privadas', () => {
    service.setPagina('Panel de administración', undefined, true);
    expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });
});
