export interface User {
    id_user: number;
    nombre: string;
    apellidos: string;
    email: string;
    password?: string;
    // El backend lo devuelve como texto ('user' | 'admin'); tras el login se guarda como array
    roles: string | string[];
    photo?: string;
    created_at?: string;
  }
