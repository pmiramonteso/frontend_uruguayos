import { Component } from '@angular/core';
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
  userImage: string = "/assets/img/avatar-IG.png";
  isDropdownMenuOpen = false;

  constructor(public router: Router, private authService: AuthService, private modalService: ModalService) {}

  ngOnInit() {
    const user = this.authService.obtenerUsuario();
    this.isLoggedIn = !!user;

    if (this.isLoggedIn) {
    this.userName = user.nombre || '';
    this.userImage = user?.photo
  ?   `${this.baseUrl}assets/img/${user.photo}`
  : '/assets/img/avatar-IG.png';
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    this.isAdmin = roles.includes('admin');
  } else {
    this.logout();
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

logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.userName = '';
        this.userImage = '/assets/img/avatar-IG.png';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
  
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
