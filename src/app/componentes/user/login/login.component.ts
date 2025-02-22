import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';
import { Access } from '../../../interface/access';
import { NotificacionesService } from '../../../service/notificaciones.service';
import { ModalService } from '../../../service/modal.service';
@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string | null = null;

  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  isModalOpen = false;
  userName: string = '';
  userImage: string = 'assets/img/default-profile.png'; // Imagen predeterminada

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionesService,
    private modalService: ModalService) {

    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
    this.modalService.isModalOpen$.subscribe((state) => {
      this.isModalOpen = state;
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = null;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response: Access) => {
          console.log("Respuesta del servidor:", response);

          if (response?.code === 1 && response?.message === 'Login OK') {
            // El login fue exitoso
            const user = response.data.user;
            const esAdmin = user.roles?.includes('admin');
            const rutaDestino = esAdmin ? 'admin' : 'perfil';

            this.notificacionService.mostrarExito(`Hola ${user.nombre}`);
            this.router.navigate([rutaDestino]);
            this.closeModal();
            this.isLoggedIn = true;
          } else {
            this.errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
          }
        },
        error: (error) => {
          console.error("Error al iniciar sesión:", error);
          this.errorMessage = 'No se pudo iniciar sesión. Verifica tus credenciales.';
        },
      });
    }
  }
  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }
  
  private guardarDatosUsuario(response: Access) {
    const { data: { accessToken, user } } = response;
    
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  closeModal() {
    this.modalService.closeModal();
  }
}
