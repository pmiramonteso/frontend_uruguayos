import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { environment } from '../../../environments/environment';
import { NotificacionesService } from '../../../service/notificaciones.service';
@Component({
    selector: 'app-perfil',
    imports: [],
    templateUrl: './perfil.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  user: any;
  isLoggedIn = false;
  userImage: string = "/assets/img/avatar-IG.webp";

  constructor(private router: Router, private authService: AuthService, private notificacionService: NotificacionesService) {
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : null;
  }

  ngOnInit() {
    const user = this.authService.obtenerUsuario();
    this.isLoggedIn = !!user;
    this.userImage = user?.photo
    ?  `${environment.endpoint}assets/img/${user.photo}`
    : '/assets/img/avatar-IG.webp';
  }

  changeProfilePicture() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    // Los mismos formatos y tamaño que acepta el backend (middlewares/upload.js)
    fileInput.accept = 'image/jpeg,image/png,image/gif,image/webp';
    fileInput.click();
  
    fileInput.onchange = (event: any) => {
      const file: File | undefined = event.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        this.notificacionService.mostrarError('La foto no puede pesar más de 2 MB');
        return;
      }
      this.uploadPhoto(file);
    };
  }
  
  uploadPhoto(file: File) {
    const formData = new FormData();
    // El backend (multer) espera el archivo en el campo "photo"
    formData.append('photo', file);
  
    this.authService.uploadPhoto(formData).subscribe({
      next: (response) => {
        this.userImage = `${environment.endpoint}assets/img/${response.photo}`;
        this.notificacionService.mostrarExito('Foto actualizada');
      },
      error: () => this.notificacionService.mostrarError('No se ha podido subir la foto. Prueba con otra imagen.')
    });
  }

  logout() {
    // authService.logout() borra también la cookie de sesión; localStorage.clear() borraba
    // además la elección de cookies del banner
    this.authService.logout().subscribe({
      complete: () => this.router.navigate(['home']),
      error: () => this.router.navigate(['home'])
    });
  }
}
