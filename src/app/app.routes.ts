import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { PanelAdminComponent } from './componentes/admin/panel-admin/panel-admin.component';
import { NegociosAdminComponent } from './componentes/admin/negocios-admin/negocios-admin.component';
import { EventosAdminComponent } from './componentes/admin/eventos-admin/eventos-admin.component';
import { BlogAdminComponent } from './componentes/admin/blog-admin/blog-admin.component';
import { UsuariosAdminComponent } from './componentes/admin/usuarios-admin/usuarios-admin.component';

import { LoginComponent } from './componentes/user/login/login.component';
import { RegistroComponent } from './componentes/user/registro/registro.component';
import { PerfilComponent } from './componentes/user/perfil/perfil.component';
import { HomeComponent } from './componentes/home/home.component';
import { CalendarioComponent } from './componentes/calendario/calendario.component';
import { BlogComponent } from './componentes/blog/blog.component';
import { GraficosComponent } from './componentes/graficos/graficos.component';
import { MapaComponent } from './componentes/mapa/mapa.component';
import { PresentacionComponent } from './componentes/presentacion/presentacion.component';
import { BlogDetalleComponent } from './componentes/blog-detalle/blog-detalle.component';
import { PoliticaCookiesComponent } from './componentes/cookies/politica-cookies.component';
import { RecuperarPasswordComponent } from './componentes/user/recuperar-password/recuperar-password.component';


export const routes: Routes = [
    { path: 'admin', component: PanelAdminComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
    { path: 'admin-negocios', component: NegociosAdminComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
    { path: 'admin-eventos', component: EventosAdminComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
    { path: 'admin-usuarios', component: UsuariosAdminComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
    { path: 'admin-blog', component: BlogAdminComponent, canActivate: [authGuard], data: { roles: ['admin'] } },

    { path: 'login', component: LoginComponent},
    { path: 'registro', component: RegistroComponent},
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard], data: { roles: ['user', 'admin'] } },
    { path: 'recuperar-password', component: RecuperarPasswordComponent},
    // El enlace del email de recuperación (lo genera el backend con este nombre)
    { path: 'change-password', component: RecuperarPasswordComponent},

    { path: 'home', component: HomeComponent},
    { path: 'calendario', component: CalendarioComponent},
    { path: 'blog', component: BlogComponent},
    { path: 'blog/:id', component: BlogDetalleComponent},
    { path: 'graficos', component: GraficosComponent},
    { path: 'mapa', component: MapaComponent},
    { path: 'presentacion', component: PresentacionComponent},
    { path: 'cookies', component: PoliticaCookiesComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home' }
];
