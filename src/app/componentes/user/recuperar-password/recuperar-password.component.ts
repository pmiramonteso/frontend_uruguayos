import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { ModalService } from '../../../service/modal.service';

// Una sola página para los dos pasos:
// - /recuperar-password: pedir el enlace por email
// - /change-password?token=...: el enlace del email, para poner la contraseña nueva
@Component({
    selector: 'app-recuperar-password',
    imports: [ReactiveFormsModule],
    templateUrl: './recuperar-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager
})
export class RecuperarPasswordComponent implements OnInit {
  token: string | null = null;
  enviando = false;
  mensaje: string | null = null;
  error: string | null = null;
  passwordCambiada = false;

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    repetir: new FormControl('', [Validators.required])
  }, { validators: (g: AbstractControl): ValidationErrors | null =>
    g.get('password')?.value === g.get('repetir')?.value ? null : { noCoinciden: true } });

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: ModalService) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  pedirEnlace(): void {
    if (this.emailForm.invalid) return;
    this.empezar();
    this.authService.solicitarCambioPassword(this.emailForm.value.email!).subscribe({
      next: (res) => { this.enviando = false; this.mensaje = res.message; },
      error: (err) => this.fallo(err)
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid || !this.token) return;
    this.empezar();
    this.authService.cambiarPassword(this.token, this.passwordForm.value.password!).subscribe({
      next: (res) => { this.enviando = false; this.mensaje = res.message; this.passwordCambiada = true; },
      error: (err) => this.fallo(err)
    });
  }

  abrirLogin(): void {
    this.modalService.openModal();
  }

  private empezar(): void {
    this.enviando = true;
    this.mensaje = null;
    this.error = null;
  }

  private fallo(err: any): void {
    this.enviando = false;
    this.error = err?.error?.message || err?.error?.errors?.[0]?.msg || 'No se ha podido completar. Inténtalo de nuevo.';
  }
}
