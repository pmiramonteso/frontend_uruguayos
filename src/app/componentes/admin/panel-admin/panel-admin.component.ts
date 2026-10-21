import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  templateUrl: './panel-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./panel-admin.component.scss']
})
export class PanelAdminComponent implements OnInit {
  user: any;
  userImage: string = "/assets/img/avatar-IG.webp";

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : null;

    if (this.user?.photo) {
      this.userImage = `${environment.endpoint}assets/img/${this.user.photo}`;
    }
  }

  goHome() {
    this.router.navigate(['/home']);
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

