import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

const SITIO = 'Uruguayos en España';
const URL_SITIO = 'https://uruguayosenespanya.com';
const DESCRIPCION_POR_DEFECTO =
  'Comunidad de uruguayos en España: eventos, negocios uruguayos en el mapa, noticias y datos sobre la emigración uruguaya.';

// Título, descripción, URL canónica y Open Graph de cada página.
// Google ejecuta JavaScript y ve estos valores; WhatsApp o Facebook no, y usan los de index.html.
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  setPagina(titulo: string | undefined, descripcion?: string, noindex = false): void {
    const tituloCompleto = titulo ? `${titulo} | ${SITIO}` : SITIO;
    const desc = descripcion || DESCRIPCION_POR_DEFECTO;
    // Siempre el dominio de producción: staging no se indexa y así no compite con él
    const url = URL_SITIO + this.document.location.pathname;

    this.title.setTitle(tituloCompleto);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: tituloCompleto });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' });
    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}

// Sustituye a la estrategia de títulos de Angular: además del título, aplica el resto de etiquetas
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let ruta: ActivatedRouteSnapshot = snapshot.root;
    while (ruta.firstChild) {
      ruta = ruta.firstChild;
    }
    this.seo.setPagina(this.buildTitle(snapshot), ruta.data['description'], !!ruta.data['noindex']);
  }
}
