import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { Blog } from '../../interface/blog';
import { environment } from '../../environments/environment';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-blog-detalle',
  imports: [RouterModule, FooterComponent],
  templateUrl: './blog-detalle.component.html',
  styleUrl: './blog-detalle.component.scss'
})

export class BlogDetalleComponent implements OnInit {
  blog: Blog | null = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
  
    if (id) {
      this.blogService.cargarBlogPorId(+id).subscribe(
        (blog) => {
          if (blog && blog.photo) {
            blog.photo = `${environment.endpoint}assets/img/${blog.photo}`;
          }
          this.blog = blog;
        },
        (error) => {
          console.error('Error al obtener el post', error);
        }
      );
    }
  }
}
  
