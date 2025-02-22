import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from '../../service/notificaciones.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-notificacion',
    imports: [CommonModule],
    templateUrl: './notificacion.component.html',
    styleUrl: './notificacion.component.scss'
})
export class NotificacionComponent implements OnInit{
  mensaje: string | null = null;
  tipo: 'success' | 'error' | null = null;

  constructor(private notificationService: NotificacionesService) {}

  ngOnInit() {
    this.notificationService.notification$.subscribe(({ message, type }) => {
      this.mensaje = message;
      this.tipo = type;
    });
  }
}
