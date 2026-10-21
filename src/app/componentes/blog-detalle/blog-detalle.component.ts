import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { Blog } from '../../interface/blog';
import { environment } from '../../environments/environment';
import { FooterComponent } from '../footer/footer.component';
import { SeoService } from '../../service/seo.service';

@Component({
  selector: 'app-blog-detalle',
  imports: [RouterModule, FooterComponent],
  templateUrl: './blog-detalle.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './blog-detalle.component.scss'
})

export class BlogDetalleComponent implements OnInit {
  blog: Blog | null = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private seo: SeoService
  ) {}

  // Descripción para Google: el contenido sin HTML, cortado a ~155 caracteres
  private resumen(html: string): string {
    const texto = (new DOMParser().parseFromString(html || '', 'text/html').body.textContent || '')
      .replace(/\s+/g, ' ').trim();
    return texto.length > 155 ? texto.slice(0, 152).replace(/\s+\S*$/, '') + '...' : texto;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
  
    if (id) {
      this.blogService.cargarBlogPorId(+id).subscribe(
        (blog) => {
          if (blog && blog.photo) {
            blog.photo = `${environment.endpoint}assets/img/${blog.photo}`;
          }
          this.blog = blog;
          if (blog) {
            this.seo.setPagina(blog.titulo, this.resumen(blog.contenido));
          }
        },
        (error) => {
          console.error('Error al obtener el post', error);
        }
      );
    }
  }
}
  
