import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy, withNavigationErrorHandler } from '@angular/router';
import { recargarSiFaltaUnChunk } from './recarga-tras-despliegue';
import { SeoTitleStrategy } from './service/seo.service';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { routes } from './app.routes';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withNavigationErrorHandler(recargarSiFaltaUnChunk)),
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
    { provide: LOCALE_ID, useValue: 'es' }
  ]
};

