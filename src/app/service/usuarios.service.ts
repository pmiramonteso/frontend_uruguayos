import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../interface/user';
import { Access } from '../interface/access';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private userUrl = `${environment.endpoint}/user`;
  private usuarioSubject = new BehaviorSubject<User | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) { }


  obtenerPerfil(): Observable<Access> {
    const token = localStorage.getItem('token') || '';
    console.log('Servicio: Obteniendo perfil');
    return this.http.get<Access>(`${this.userUrl}usuario/perfil`).pipe(
      tap(response => {
        console.log('Servicio: Respuesta recibida:', response);
        if (response?.data?.user) {
          console.log('Servicio: Usuario obtenido:', response.data.user);
          this.usuarioSubject.next(response.data.user);
        } else {
          console.warn('Servicio: No se encontró el usuario en la respuesta.');
        }
      })
    );
  }

/*obtenerTodos(): Observable<User[]> {
  return this.http.get<{code:number, msg:string, data:User[]}>(`${this.userUrl}`)
  .pipe(tap(response => response.data))
}

guardar(user: User): Observable<User> { //o void?
  return this.http.post<User>(`${this.userUrl}`, user);
}

actualizar(user: User): Observable<User> { //o void?
return this.http.put<User>(`${this.userUrl}`, user);
}

eliminar(id: number): Observable<void> {
return this.http.delete<void>(`${this.userUrl}${id}`);  
}*/

isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}
}
