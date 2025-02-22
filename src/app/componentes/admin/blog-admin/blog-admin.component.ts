import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogService } from '../../../service/blog.service';
import { EditorModule  } from '@tinymce/tinymce-angular';
import { Blog } from '../../../interface/blog';
import { NotificacionesService } from '../../../service/notificaciones.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-blog-admin',
    imports: [ReactiveFormsModule, EditorModule, CommonModule],
    templateUrl: './blog-admin.component.html',
    styleUrl: './blog-admin.component.scss'
})
export class BlogAdminComponent implements OnInit{
  blogForm!: FormGroup;
  editando = false;
  agregando = false;
  mostrarFormularioBlog: boolean = false;
  blogEditando: any = null;
  blogs: Blog[] = [];
  selectedFile: File | null = null;

  editorConfig = {
    apiKey: 'qobixfl8d269htsdhbgkwr5cglvx91ltdouomicefl5sxc3x',
    height: 500,
    menubar: false,
    plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'wordcount'],
    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
  };
  
  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private notificationService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.blogForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      contenido: ['', [Validators.required, Validators.minLength(20)]],
      categoria: [''],
      autor: [''],
      status: [true]
    });
      this.cargarBlogs();
  }

  cargarBlogs(): void {
    this.blogService.cargarBlogs().subscribe((blogs) => {
      console.log('Posts obtenidos:', blogs);
        this.blogs = blogs;
      },
      error => {
        console.error('Error al obtener posts', error);
      });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  agregarBlog(): void {
    this.mostrarFormularioBlog = !this.mostrarFormularioBlog;
    this.editando = true;
    this.agregando = true;

    if (this.blogForm.valid) {
      const blogData = new FormData();
    blogData.append('titulo', this.blogForm.get('titulo')?.value);
    blogData.append('contenido', this.blogForm.get('contenido')?.value);
    blogData.append('categoria', this.blogForm.get('categoria')?.value);
    blogData.append('autor', 'Paola Miramontes');
    blogData.append('status', this.blogForm.get('status')?.value);
    if (this.selectedFile) {
      blogData.append('photo', this.selectedFile);
    }

      if (this.editando && this.blogEditando) {
        this.blogService.updateBlog(this.blogEditando.id_blog, blogData).subscribe(() => {
          this.notificationService.mostrarExito('Post actualizado con éxito');
          this.resetFormulario();
          this.cargarBlogs();
        });
      } else {
        this.blogService.createBlog(blogData).subscribe({
          next: (response) => {
            console.log('Post creado:', response);
            this.notificationService.mostrarExito('Post creado con éxito');
            this.resetFormulario();
            this.cargarBlogs();
          },
          error: (error) => {
            console.error('Error al crear el blog', error);
            this.notificationService.mostrarError('No se pudo crear el blog');
          }
        });
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  resetFormulario(): void {
    this.mostrarFormularioBlog = false;
    this.blogForm.reset();
    this.editando = false;
    this.agregando = false;
    this.blogEditando = null;
  }

  editarBlog(blog: Blog): void {
    this.editando = true;
    this.agregando = false;
    
    this.blogEditando = blog;
    this.blogForm.patchValue({
      titulo: blog.titulo,
      contenido: blog.contenido,
      categoria: blog.categoria,
      status: blog.status
    });
    this.mostrarFormularioBlog = true;
  }

  eliminarBlog(blog: Blog): void {
    if (confirm('¿Estás seguro de que deseas eliminar este blog?')) {
      if(blog.id_blog) {
      this.blogService.deleteBlog(blog.id_blog).subscribe({
        next: () => {
          this.notificationService.mostrarExito('Post eliminado con éxito');
          this.cargarBlogs();
        },
        error: (error) => {
          console.error('Error al eliminar el blog:', error);
          this.notificationService.mostrarError('No se pudo eliminar el post');
        }
      });
    }
  }
}
  
}
