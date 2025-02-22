import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NotificacionComponent } from './componentes/notificacion/notificacion.component';
import { NavegacionComponent } from './componentes/navegacion/navegacion.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificacionComponent, NavegacionComponent, CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  showNavbar: boolean = true;
  isHomeRoute = false;
  title = 'proj_uruguayos';
  noNavbarRoutes: string[] = ['/login', '/registro', '/admin'];
  excludeMargin = false;
  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomeRoute = this.router.url === '/home';
  }
});
}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects.split('?')[0];
        this.showNavbar = !this.noNavbarRoutes.includes(currentUrl);
        this.excludeMargin = ['/home', '/admin'].includes(currentUrl);
      }
    });
  }
}
