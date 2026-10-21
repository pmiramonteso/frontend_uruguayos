import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ModalService } from '../service/modal.service';

// Protege las rutas que tienen data: { roles: [...] }. Es solo para la interfaz:
// los datos los protege el backend, que comprueba el rol en cada petición.
export const authGuard: CanActivateFn = (route) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const modalService = inject(ModalService);

  const user = authService.obtenerUsuario();
  const token = authService.getToken();

  const permitidos: string[] = route.data['roles'] ?? [];
  // Tras el login roles es un array; tras el registro llega como texto
  const rolesUsuario: string[] = Array.isArray(user?.roles) ? user.roles : [user?.roles];

  if (token && user && permitidos.some(role => rolesUsuario.includes(role))) {
    return true;
  }

  // Sin sesión: a la portada con el login abierto. Con sesión pero sin permiso: solo a la portada.
  if (!token || !user) {
    modalService.openModal();
  }
  return router.parseUrl('/home');
};
