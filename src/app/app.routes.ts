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


export const routes: Routes = [
    { path: 'admin', component: PanelAdminComponent},
    { path: 'admin-negocios', component: NegociosAdminComponent},
    { path: 'admin-eventos', component: EventosAdminComponent},
    { path: 'admin-usuarios', component: UsuariosAdminComponent},
    { path: 'admin-blog', component: BlogAdminComponent},

    { path: 'login', component: LoginComponent},
    { path: 'registro', component: RegistroComponent},
    { path: 'perfil', component: PerfilComponent},

    { path: 'home', component: HomeComponent},
    { path: 'calendario', component: CalendarioComponent},
    { path: 'blog', component: BlogComponent},
    { path: 'blog/:id', component: BlogDetalleComponent},
    { path: 'graficos', component: GraficosComponent},
    { path: 'mapa', component: MapaComponent},
    { path: 'presentacion', component: PresentacionComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home' }
];
