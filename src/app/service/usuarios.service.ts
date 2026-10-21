import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../interface/user';

// Administración de usuarios (solo admin). El backend comprueba el rol en cada petición.
@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private userUrl = `${environment.endpoint}user`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerTodos(): Observable<User[]> {
    return this.http.get<{ code: number, message: string, data: User[] }>(`${this.userUrl}/todos`, { headers: this.getAuthHeaders() })
      .pipe(map(response => response.data));
  }

  cambiarRol(id: number, roles: 'user' | 'admin'): Observable<any> {
    return this.http.patch(`${this.userUrl}/${id}/rol`, { roles }, { headers: this.getAuthHeaders() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.userUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
