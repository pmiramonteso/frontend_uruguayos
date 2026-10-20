import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { NavegacionComponent } from './navegacion.component';
import { AuthService } from '../../service/auth.service';

describe('NavegacionComponent', () => {
  let component: NavegacionComponent;
  let fixture: ComponentFixture<NavegacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavegacionComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavegacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sin sesión no cierra sesión ni redirige (los enlaces directos deben funcionar)', () => {
    localStorage.removeItem('user');
    const logoutSpy = vi.spyOn(TestBed.inject(AuthService), 'logout');
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');

    const nuevo = TestBed.createComponent(NavegacionComponent);
    nuevo.detectChanges();

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(nuevo.componentInstance.isLoggedIn).toBe(false);
  });
});
