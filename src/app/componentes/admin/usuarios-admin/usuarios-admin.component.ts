import { Component, OnInit } from '@angular/core';
import { User } from '../../../interface/user';
import { UsuariosService } from '../../../service/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-lista-usuarios',
    imports: [FormsModule],
    templateUrl: './usuarios-admin.component.html',
    styleUrl: './usuarios-admin.component.scss'
})

export class UsuariosAdminComponent {
  usuarios: User[] = [];
  currentUser: User = {
    id_user: 0, // Ajusta a 0 para que siempre sea válido
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    roles: [],
    photo: '', // Si usas photo en el modelo, inicialízalo
  };
  showForm: boolean = false;

  constructor(private usuariosService: UsuariosService, private router: Router) {}


}