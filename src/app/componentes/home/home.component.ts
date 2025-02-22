import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../service/blog.service';
import { Blog } from '../../interface/blog';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { ModalService } from '../../service/modal.service';
import { RegistroComponent } from '../user/registro/registro.component';
import { environment } from '../../environments/environment';
@Component({
    selector: 'app-home',
    imports: [CommonModule, FooterComponent, RegistroComponent, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{
  blogs: Blog[] = [];
  defaultImageUrl: string = 'assets/img/avatar-IG.jpg';
  showModal: 'login' | 'registro' | 'none' = 'none';

constructor(private blogService: BlogService, private modalService: ModalService) {}


ngOnInit(): void {
      this.cargarBlogs();
  }

  cargarBlogs(): void {
    this.blogService.cargarBlogs().subscribe((blogs) => {
        this.blogs = blogs.map(blog => {
          blog.photo = blog.photo ?  `${environment.endpoint}assets/img/${blog.photo}` : this.defaultImageUrl;
          return blog;
        });
      },
      error => {
        console.error('Error al obtener eventos', error);
      });
  }

  openModal(modalType: 'login' | 'registro'): void {
    this.showModal = modalType;
    this.modalService.openModal();
  }
  closeModal(): void {
    this.showModal = 'none';
    this.modalService.closeModal();
  }
}
