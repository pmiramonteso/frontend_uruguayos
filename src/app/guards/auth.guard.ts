import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.obtenerUsuario();
  const token = authService.getToken();

  const roles: string[] = route.data['roles']; 

  if (token && user) { 
    console.log("Roles match:", roles.some(role => user['roles']?.includes(role)));
    if (roles.some(role => user['roles']?.includes(role))) {
      return true;
    }
}

router.navigate(['/login']);
return false;
};
