export interface User {
    id_user: number;
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    roles: string[];
    photo?: string;
  }