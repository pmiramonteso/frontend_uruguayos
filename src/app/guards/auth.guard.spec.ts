import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { authGuard } from './auth.guard';
import { ModalService } from '../service/modal.service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const ruta = (roles: string[]) => ({ data: { roles } }) as unknown as ActivatedRouteSnapshot;
  const estado = {} as RouterStateSnapshot;
  const iniciarSesion = (roles: unknown) => {
    localStorage.setItem('token', 'token-de-prueba');
    localStorage.setItem('user', JSON.stringify({ nombre: 'Prueba', roles }));
  };

  beforeEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()]
    });
  });

  it('sin sesión manda a la portada y abre el login', () => {
    const abrir = vi.spyOn(TestBed.inject(ModalService), 'openModal');
    const resultado = executeGuard(ruta(['admin']), estado);
    expect((resultado as UrlTree).toString()).toBe('/home');
    expect(abrir).toHaveBeenCalled();
  });

  it('un usuario normal no entra en admin', () => {
    iniciarSesion(['user']);
    const abrir = vi.spyOn(TestBed.inject(ModalService), 'openModal');
    const resultado = executeGuard(ruta(['admin']), estado);
    expect((resultado as UrlTree).toString()).toBe('/home');
    expect(abrir).not.toHaveBeenCalled();
  });

  it('un admin entra en admin', () => {
    iniciarSesion(['admin']);
    expect(executeGuard(ruta(['admin']), estado)).toBe(true);
  });

  it('acepta el rol guardado como texto (después del registro)', () => {
    iniciarSesion('user');
    expect(executeGuard(ruta(['user', 'admin']), estado)).toBe(true);
    expect(executeGuard(ruta(['admin']), estado)).not.toBe(true);
  });
});
