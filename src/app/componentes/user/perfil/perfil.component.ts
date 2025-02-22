import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { environment } from '../../../environments/environment';
@Component({
    selector: 'app-perfil',
    imports: [],
    templateUrl: './perfil.component.html',
    styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  user: any;
  isLoggedIn = false;
  userImage: string = "/assets/img/avatar-IG.png";

  constructor(private router: Router, private authService: AuthService) {
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : null;
  }

  ngOnInit() {
    const user = this.authService.obtenerUsuario();
    this.isLoggedIn = !!user;
    this.userImage = user?.photo
    ?  `${environment.endpoint}assets/img/${user.photo}`
    : '/assets/img/avatar-IG.png';
  }

  changeProfilePicture() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();
  
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadPhoto(file);
      }
    };
  }
  
  uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('profilePicture', file);
  
    this.authService.uploadPhoto(formData).subscribe((response) => {
      if (response.success) {
        this.user.profilePictureUrl = response.imageUrl;
      }
    });
  }

  
  logout() {
    localStorage.clear();
    this.router.navigate(['home']);
  }
}
