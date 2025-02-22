import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError, tap } from 'rxjs';
import { Negocio } from '../interface/negocio';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NegociosService {
private apiUrl = `${environment.endpoint}api/negocios`;
  
constructor(private http: HttpClient) { }

private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
}

obtenerNegocios(): Observable<Negocio[]> {
  return this.http.get<{code:number, message:string, data:Negocio[]}>(this.apiUrl).pipe(
    map((response) => response.data)
  );
}

crearNegocio(negocio: Negocio): Observable<Negocio> {
  const headers = this.getAuthHeaders();
  return this.http.post<Negocio>(this.apiUrl, negocio, { headers }).pipe(
    tap(response => {
      console.log('Negocio creado exitosamente:', response);
    }),
    catchError(error => {
      console.error('Error al crear negocio:', error);
      return throwError(() => error);
    })
  );
}

actualizarNegocio(negocio: Negocio): Observable<Negocio> {
  const headers = this.getAuthHeaders();
  return this.http.patch<Negocio>(`${this.apiUrl}/${negocio.id_negocio}`, negocio, { headers }).pipe(
    tap(response => {
      console.log('Negocio actualizado exitosamente:', response);
    }),
    catchError(error => {
      console.error('Error al actualizar negocio:', error);
      return throwError(() => error);
    })
  );
}

eliminarNegocio(id: number): Observable<Negocio> {
  const headers = this.getAuthHeaders();
  return this.http.delete<Negocio>(`${this.apiUrl}/${id}`, { headers }).pipe(
    tap(response => {
      console.log('Negocio eliminado exitosamente:', response);
    }),
    catchError(error => {
      console.error('Error al eliminar negocio:', error);
      return throwError(() => error);
    })
  );
}
}