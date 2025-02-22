import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { Observable, catchError, throwError, tap } from 'rxjs';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let clonedReq = req;

    if (token) {
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      clonedReq = req.clone({
        setHeaders: {
          Authorization: formattedToken
        },
        withCredentials: true
      });
    }

    return next.handle(clonedReq).pipe(
      tap({
        next: (event) => console.log('Respuesta:', event),
        error: (error) => {
          console.log('Error en la petición:', error);
          if (error.status === 401 || error.status === 403) {
            this.authService.logout(); // Limpia el token y redirige al login
          }
        }
      }),
      catchError(error => throwError(() => error))
    );
  }
}