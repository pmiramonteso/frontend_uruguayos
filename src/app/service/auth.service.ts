import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, BehaviorSubject, tap, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { Access } from '../interface/access';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.endpoint}`
  private usuarioLogueado = new BehaviorSubject<any>(this.obtenerUsuario());
  usuarioLogueado$ = this.usuarioLogueado.asObservable();

  constructor(private http: HttpClient) {}
  
  actualizarUsuarioLogueado() {
    const user = this.obtenerUsuario();
    console.log('Actualizando usuario logueado:', user);
    this.usuarioLogueado.next(user);
  }

  registro(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/registro`, formData).pipe(
      map((response) => response),
      catchError((error) => {
        console.error('Error en el registro:', error);
        throw error;
      })
    );
  }
 /*     map((response: Access) => {
        const { accessToken, data } = response;
  
        if (accessToken && data?.user) {
          console.log('Datos del usuario registrado:', data.user);
          
          localStorage.setItem('token', accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          console.error('La respuesta no contiene un token o datos de usuario válidos.');
        }
  
        return response;
      }),
      catchError(error => {
        console.error('Error en el registro:', error);
        throw error;
      })
    );
  }*/

  login(email: string, password: string): Observable<Access> {
    return this.http.post<Access>(`${this.apiUrl}auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap(response => {
      
        if (response && response.data) {
          const token = response.data.accessToken;
          const user = response.data.user;

          if (token) {
            if (user && !Array.isArray(user.roles)) {
              user.roles = [user.roles];
            }
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
 
          const esAdmin = user?.roles?.includes('admin') ?? false;
          localStorage.setItem('isAdmin', JSON.stringify(esAdmin));
  
          this.actualizarUsuarioLogueado();
        } else {
          console.warn('Respuesta del login no contiene el token esperado');
        }
      }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => new Error('Error en login: ' + (error.error?.message || error.message)));
      })
    );
  }
  

  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token;
  }

  uploadPhoto(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}user/upload-photo`, formData, { withCredentials: true }).pipe(
      map(response => {
      if (response.photo) {

        const photoUrl = `http://localhost:3000/assets/img/${response.photo}`;

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.photo = photoUrl;
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response;
      })
    );
  }

  isLoggedIn(): boolean {
    const loggedIn = !!this.getToken();
    console.log('¿Está logueado?:', loggedIn);
    return loggedIn;
  }
  
  obtenerUsuario(): any {
    const usuarioStr = localStorage.getItem('user');
    try {
      const user = usuarioStr ? JSON.parse(usuarioStr) : null;
      return user;
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.usuarioLogueado.next(null);
      }),
      catchError(error => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.usuarioLogueado.next(null);
        throw error;
      })
    );
  }
}
