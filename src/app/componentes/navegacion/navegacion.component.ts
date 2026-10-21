import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ModalService } from '../../service/modal.service';
import { RegistroComponent } from '../user/registro/registro.component';
import { LoginComponent } from '../user/login/login.component';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-navegacion',
    imports: [RouterModule, RegistroComponent, LoginComponent],
    templateUrl: './navegacion.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './navegacion.component.scss'
})
export class NavegacionComponent {
  private baseUrl = environment.endpoint;
  isMobileMenuOpen = false;
  isMobileMenu = false;
  showModal: 'login' | 'registro' | 'none' = 'none';
  isAdmin = false;
  isLoggedIn = false;
  userName = '';
  userImage: string = "/assets/img/avatar-IG.webp";
  isDropdownMenuOpen = false;

  constructor(public router: Router, private authService: AuthService, private modalService: ModalService) {}

  ngOnInit() {
    const user = this.authService.obtenerUsuario();
    this.isLoggedIn = !!user;

    if (this.isLoggedIn) {
    this.userName = user.nombre || '';
    this.userImage = user?.photo
  ?   `${this.baseUrl}assets/img/${user.photo}`
  : '/assets/img/avatar-IG.webp';
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    this.isAdmin = roles.includes('admin');
  } else {
    // Sin sesión: solo limpiar los datos locales. No llamar a logout(), que redirige
    // a /home y haría que los enlaces directos (/mapa, /calendario...) acabaran en la portada
    this.limpiarSesion();
  }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

toggleDropdownMenu(): void {
  this.isDropdownMenuOpen = !this.isDropdownMenuOpen;
}

private limpiarSesion(): void {
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.userName = '';
    this.userImage = '/assets/img/avatar-IG.webp';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.limpiarSesion();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error cerrando sesión:', err);
      },
    });
  }

  openModal(modalType: 'login' | 'registro'): void {
    this.showModal = modalType;
    this.modalService.openModal();
  }
  closeModal(): void {
    this.showModal = 'none';
    this.modalService.closeModal();
  }
}
