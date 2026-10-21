import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { HomeComponent } from './componentes/home/home.component';

// La portada va en el paquete inicial; el resto de páginas se descarga al visitarlas.
// title y data.description los usa SeoTitleStrategy para el <title>, la descripción y Open Graph.
// noindex: páginas privadas o de trámite que no deben aparecer en Google.

const SOLO_ADMIN = { roles: ['admin'], noindex: true };

export const routes: Routes = [
    { path: 'admin', title: 'Panel de administración', canActivate: [authGuard], data: SOLO_ADMIN,
      loadComponent: () => import('./componentes/admin/panel-admin/panel-admin.component').then(m => m.PanelAdminComponent) },
    { path: 'admin-negocios', title: 'Admin · Negocios', canActivate: [authGuard], data: SOLO_ADMIN,
      loadComponent: () => import('./componentes/admin/negocios-admin/negocios-admin.component').then(m => m.NegociosAdminComponent) },
    { path: 'admin-eventos', title: 'Admin · Eventos', canActivate: [authGuard], data: SOLO_ADMIN,
      loadComponent: () => import('./componentes/admin/eventos-admin/eventos-admin.component').then(m => m.EventosAdminComponent) },
    { path: 'admin-usuarios', title: 'Admin · Usuarios', canActivate: [authGuard], data: SOLO_ADMIN,
      loadComponent: () => import('./componentes/admin/usuarios-admin/usuarios-admin.component').then(m => m.UsuariosAdminComponent) },
    { path: 'admin-blog', title: 'Admin · Noticias', canActivate: [authGuard], data: SOLO_ADMIN,
      loadComponent: () => import('./componentes/admin/blog-admin/blog-admin.component').then(m => m.BlogAdminComponent) },

    { path: 'login', title: 'Iniciar sesión', data: { noindex: true },
      loadComponent: () => import('./componentes/user/login/login.component').then(m => m.LoginComponent) },
    { path: 'registro', title: 'Crear cuenta', data: { noindex: true },
      loadComponent: () => import('./componentes/user/registro/registro.component').then(m => m.RegistroComponent) },
    { path: 'perfil', title: 'Mi perfil', canActivate: [authGuard], data: { roles: ['user', 'admin'], noindex: true },
      loadComponent: () => import('./componentes/user/perfil/perfil.component').then(m => m.PerfilComponent) },
    { path: 'recuperar-password', title: 'Recuperar contraseña', data: { noindex: true },
      loadComponent: () => import('./componentes/user/recuperar-password/recuperar-password.component').then(m => m.RecuperarPasswordComponent) },
    // El enlace del email de recuperación (lo genera el backend con este nombre)
    { path: 'change-password', title: 'Nueva contraseña', data: { noindex: true },
      loadComponent: () => import('./componentes/user/recuperar-password/recuperar-password.component').then(m => m.RecuperarPasswordComponent) },

    { path: 'home', component: HomeComponent,
      data: { description: 'Comunidad de uruguayos en España: eventos, negocios uruguayos en el mapa, noticias y datos sobre la emigración uruguaya.' } },
    { path: 'calendario', title: 'Eventos uruguayos en España',
      data: { description: 'Calendario con los próximos eventos de la comunidad uruguaya en España.' },
      loadComponent: () => import('./componentes/calendario/calendario.component').then(m => m.CalendarioComponent) },
    { path: 'blog', title: 'Noticias',
      data: { description: 'Noticias y artículos sobre la comunidad uruguaya en España y los vínculos entre Uruguay y España.' },
      loadComponent: () => import('./componentes/blog/blog.component').then(m => m.BlogComponent) },
    // El título y la descripción de cada noticia los pone BlogDetalleComponent al cargarla
    { path: 'blog/:id', title: 'Noticias',
      loadComponent: () => import('./componentes/blog-detalle/blog-detalle.component').then(m => m.BlogDetalleComponent) },
    { path: 'graficos', title: 'Uruguayos en España en cifras',
      data: { description: 'Datos sobre la emigración uruguaya: cuántos uruguayos viven en España, con qué nacionalidad y en qué países del mundo.' },
      loadComponent: () => import('./componentes/graficos/graficos.component').then(m => m.GraficosComponent) },
    { path: 'mapa', title: 'Negocios uruguayos en España',
      data: { description: '¿Dónde encontrar un chivito? Mapa de restaurantes, panaderías y tiendas uruguayas en España.' },
      loadComponent: () => import('./componentes/mapa/mapa.component').then(m => m.MapaComponent) },
    { path: 'presentacion', title: 'Nuestra historia',
      data: { description: 'Quiénes somos y cómo nació Uruguayos en España, la comunidad que conecta a los uruguayos en España desde 2021.' },
      loadComponent: () => import('./componentes/presentacion/presentacion.component').then(m => m.PresentacionComponent) },
    { path: 'cookies', title: 'Política de cookies',
      data: { description: 'Qué cookies usa Uruguayos en España y cómo cambiar tu elección.' },
      loadComponent: () => import('./componentes/cookies/politica-cookies.component').then(m => m.PoliticaCookiesComponent) },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home' }
];
