import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { User } from '../../../interface/user';
import { UsuariosService } from '../../../service/usuarios.service';
import { NotificacionesService } from '../../../service/notificaciones.service';
import { AuthService } from '../../../service/auth.service';

@Component({
    selector: 'app-lista-usuarios',
    imports: [DatePipe],
    templateUrl: './usuarios-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './usuarios-admin.component.scss'
})
export class UsuariosAdminComponent implements OnInit {
  usuarios: User[] = [];
  cargando = true;
  idPropio: number | null = null;

  constructor(
    private usuariosService: UsuariosService,
    private notificationService: NotificacionesService,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.idPropio = this.authService.obtenerUsuario()?.id_user ?? null;
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.usuariosService.obtenerTodos().subscribe({
      next: (usuarios) => { this.usuarios = usuarios; this.cargando = false; },
      error: () => {
        this.cargando = false;
        this.notificationService.mostrarError('No se han podido cargar los usuarios');
      }
    });
  }

  esAdmin(user: User): boolean {
    return ([] as string[]).concat(user.roles).includes('admin');
  }

  cambiarRol(user: User): void {
    const nuevo = this.esAdmin(user) ? 'user' : 'admin';
    const texto = nuevo === 'admin'
      ? `¿Dar permisos de administrador a ${user.nombre}? Podrá crear, editar y borrar todo el contenido.`
      : `¿Quitar los permisos de administrador a ${user.nombre}?`;
    if (!confirm(texto)) return;

    this.usuariosService.cambiarRol(user.id_user, nuevo).subscribe({
      next: () => {
        user.roles = nuevo;
        this.notificationService.mostrarExito('Rol actualizado');
      },
      error: (err) => this.notificationService.mostrarError(err?.error?.message || 'Error al cambiar el rol')
    });
  }

  eliminar(user: User): void {
    if (!confirm(`¿Eliminar la cuenta de ${user.nombre} (${user.email})? No se puede deshacer.`)) return;

    this.usuariosService.eliminar(user.id_user).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id_user !== user.id_user);
        this.notificationService.mostrarExito('Usuario eliminado');
      },
      error: (err) => this.notificationService.mostrarError(err?.error?.message || 'Error al eliminar el usuario')
    });
  }
}
