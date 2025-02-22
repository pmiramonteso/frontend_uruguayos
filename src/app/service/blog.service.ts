import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { Blog } from '../interface/blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private apiUrl = `${environment.endpoint}api/posts`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  
  cargarBlogs(): Observable<Blog[]> {
    return this.http.get<{code:number, message:string, data:Blog[]}>(this.apiUrl).pipe(
      map((response) => response.data)
    );
  }

  cargarBlogPorId(id_blog: number): Observable<Blog> {
    return this.http.get<{ code: number, message: string, data: Blog }>(`${this.apiUrl}/${id_blog}`).pipe(
      map((response) => response.data)
    );
  }
  
  createBlog(blogData: FormData): Observable<Blog> {
    const headers =  this.getAuthHeaders();
    return this.http.post<Blog>(this.apiUrl, blogData, { headers }).pipe(
      tap(response => {
        console.log('Respuesta de la API al crear blog:', response);
      }),
      catchError(error => {
        console.error('Error al crear post:', error);
        return throwError(() => error);
      })
    );
  }

  updateBlog(blogId: number, blogData: FormData): Observable<Blog> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Blog>(`${this.apiUrl}/${blogId}`, blogData, { headers }).pipe(
      tap(response => {
        console.log('Respuesta de la API al actualizar post:', response);
      }),
      catchError(error => {
        console.error('Error al actualizar post:', error);
        return throwError(() => error);
      })
    );
  }

  deleteBlog(id: number): Observable<void> {
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

}
