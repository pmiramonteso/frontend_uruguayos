import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UsuariosAdminComponent } from './usuarios-admin.component';

describe('UsuariosAdminComponent', () => {
  let component: UsuariosAdminComponent;
  let fixture: ComponentFixture<UsuariosAdminComponent>;
  let http: HttpTestingController;

  const usuarios = [
    { id_user: 1, nombre: 'Ana', apellidos: 'Admin', email: 'ana@example.com', roles: 'admin', created_at: '2026-01-10T10:00:00Z' },
    { id_user: 2, nombre: 'Bruno', apellidos: 'User', email: 'bruno@example.com', roles: 'user', created_at: '2026-02-10T10:00:00Z' },
  ];

  beforeEach(async () => {
    // Sesión iniciada como Ana (id 1)
    localStorage.setItem('user', JSON.stringify({ id_user: 1, nombre: 'Ana', roles: ['admin'] }));
    await TestBed.configureTestingModule({
      imports: [UsuariosAdminComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UsuariosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('user/todos')).flush({ code: 1, message: 'Usuarios', data: usuarios });
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('user'));

  it('muestra la lista de usuarios', () => {
    expect(component.usuarios.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('bruno@example.com');
  });

  it('en tu propia cuenta no hay botones para cambiar el rol ni eliminar', () => {
    const filas: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
    expect(filas[0].textContent).toContain('Tu cuenta');
    expect(filas[0].querySelectorAll('button').length).toBe(0);
    expect(filas[1].querySelectorAll('button').length).toBe(2);
  });

  it('reconoce el rol como texto o como lista', () => {
    expect(component.esAdmin({ ...usuarios[0], roles: 'admin' })).toBe(true);
    expect(component.esAdmin({ ...usuarios[0], roles: ['admin'] })).toBe(true);
    expect(component.esAdmin({ ...usuarios[1], roles: 'user' })).toBe(false);
  });
});
