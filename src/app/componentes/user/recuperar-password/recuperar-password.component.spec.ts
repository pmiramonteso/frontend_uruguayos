import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { RecuperarPasswordComponent } from './recuperar-password.component';

describe('RecuperarPasswordComponent', () => {
  let component: RecuperarPasswordComponent;
  let fixture: ComponentFixture<RecuperarPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperarPasswordComponent],
      providers: [provideRouter([]), provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sin token muestra el formulario para pedir el enlace', () => {
    expect(component.token).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('¿Has olvidado tu contraseña?');
  });

  it('exige que las dos contraseñas coincidan', () => {
    component.passwordForm.setValue({ password: 'secreta1', repetir: 'otra-cosa' });
    expect(component.passwordForm.errors?.['noCoinciden']).toBe(true);
    component.passwordForm.setValue({ password: 'secreta1', repetir: 'secreta1' });
    expect(component.passwordForm.valid).toBe(true);
  });
});
