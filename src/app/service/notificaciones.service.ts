import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private notificationSubject = new BehaviorSubject<{ message: string | null, type: 'success' | 'error' | null }>({ message: null, type: null });
  notification$ = this.notificationSubject.asObservable();

  mostrarExito(message: string, duration: number = 3000){
    this.notificationSubject.next({ message, type: 'success' });
    setTimeout(() => {
      this.notificationSubject.next({ message: null, type: null });
    }, duration);
  }

  mostrarError(message: string, duration: number = 3000){
    this.notificationSubject.next({ message, type: 'error' });
    setTimeout(() => {
      this.notificationSubject.next({ message: null, type: null });
    }, duration);
  }
}

