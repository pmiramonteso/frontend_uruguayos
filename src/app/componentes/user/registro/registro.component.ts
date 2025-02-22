import { Component} from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';
import { NotificacionesService } from '../../../service/notificaciones.service';
import { ModalService } from '../../../service/modal.service';
@Component({
    selector: 'app-registro',
    imports: [ReactiveFormsModule],
    templateUrl: './registro.component.html',
    styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  selectedFile: File | null = null;
  correoEnUso: string | null = null;
  registroForm: FormGroup;
  isModalOpen = false;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionesService,
    private modalService: ModalService
  ) {
    this.registroForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      apellidos: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&.]{6,}$/)
      ]),
      photo: new FormControl(null)
    });
    this.modalService.isModalOpen$.subscribe((state) => {
      this.isModalOpen = state;
    });
  }
  
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      console.log('Archivo seleccionado:', this.selectedFile);
    }
  }

  onSubmit() {
    if (this.registroForm.valid) {
      this.correoEnUso = null;
  
      const formData = new FormData();
      const { nombre, apellidos, email, password } = this.registroForm.value;
      
      formData.append('nombre', nombre);
      formData.append('apellidos', apellidos);
      formData.append('email', email);
      formData.append('password', password);
  
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile);
      }

      this.authService.registro(formData).subscribe({
        next: (response) => {
          if (response.accessToken) {
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this.authService.actualizarUsuarioLogueado();
            const userRole = response.data.user.roles;
  
            if (userRole === 'admin') {
              this.notificacionService.mostrarExito(`Registrado con éxito ${response.data.user.nombre}`);
              this.router.navigate(['admin']);
            } else {
              this.notificacionService.mostrarExito(`Registrado con éxito ${response.data.user.nombre}`);
              this.router.navigate(['perfil']);
            }
            this.closeModal();
          } else {
            alert('Error al registrar por token');
          }
        },
        error: (error) => {
          if (error.error?.errors) {
            this.correoEnUso = error.error.errors.find((err: any) => err.param === 'email')?.msg || null;
          }
        }
      });
    }
  }
  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }
  closeModal() {
    this.modalService.closeModal();
  }
}