import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, Subject, tap, catchError, throwError } from 'rxjs';
import { Evento } from '../interface/evento';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private eventosActualizados = new Subject<void>();
  private apiUrl = `${environment.endpoint}api/eventos`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getEventos(): Observable<Evento[]> {
    return this.http.get<{code:number, message:string, data:Evento[]}>(this.apiUrl).pipe(
      map((response) => response.data)
    );
  }

  crearEvento(eventoData: FormData): Observable<Evento> {
    const headers =  this.getAuthHeaders();    
    return this.http.post<Evento>(this.apiUrl, eventoData, { headers }).pipe(
      tap(response => {
        console.log('Respuesta de la API al crear evento:', response);
      }),
      catchError(error => {
        console.error('Error al crear evento:', error);
        return throwError(() => error);
      })
    );
  }

actualizarEvento(evento: Evento): Observable<Evento> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Evento>(`${this.apiUrl}/${evento.id_evento}`, evento, { headers }).pipe(
      tap(response => {
        console.log('Respuesta de la API al actualizar evento:', response);
      }),
      catchError(error => {
        console.error('Error al actualizar evento:', error);
        return throwError(() => error);
      })
    );
  }
  
  eliminarEvento(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => {
        console.log('Evento eliminado correctamente');
      }),
      catchError(error => {
        console.error('Error al eliminar evento:', error);
        return throwError(() => error);
      })
    );
  }

  getEventosActualizados() {
    return this.eventosActualizados.asObservable();
  }

  notificarActualizacion() {
    this.eventosActualizados.next();
  }
}
