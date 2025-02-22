export interface Evento {
    id_evento?: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    fecha_fin?: string | null,
    hora_inicio: string,
    hora_fin?: string | null,
    color?: string,
    entrada: string;
    precio?: number;
    ubicacion: string;
    photo?: string;
    createdAt?: string;
    updatedAt?: string;
  }
