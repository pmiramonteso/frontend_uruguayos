import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { Grafico } from '../interface/grafico';


@Injectable({
  providedIn: 'root'
})
export class GraficosService {

  private apiUrl = `${environment.endpoint}api/graficos`;

  constructor(private http: HttpClient) { }

 getDatos(): Observable<Grafico[]> {
    return this.http.get<{code:number, message:string, data:Grafico[]}>(this.apiUrl).pipe(
      map((response) => response.data)
    );
  }
  addDato(dato: Grafico): Observable<Grafico> {
    return this.http.post<Grafico>(`${this.apiUrl}`, dato);
  }
  
  updateDato(dato: Grafico): Observable<Grafico> {
    return this.http.patch<Grafico>(`${this.apiUrl}/${dato.id_datos}`, dato);
  }
  
  deleteDato(id: number): Observable<Grafico> {
    return this.http.delete<Grafico>(`${this.apiUrl}/${id}`);
  }

  getGrafico1(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/grafico1`);
  }

  getGrafico3(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/grafico3`);
  }

  getGrafico4(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/grafico4`);
  }
}
