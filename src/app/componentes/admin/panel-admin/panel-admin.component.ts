import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.scss']
})
export class PanelAdminComponent implements OnInit {
  user: any;
  userImage: string = "/assets/img/avatar-IG.png";

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : null;

    if (this.user?.photo) {
      this.userImage = `https://uruguayosenespanya.com/assets/img/${this.user.photo}`;
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['home']);
  }
}

