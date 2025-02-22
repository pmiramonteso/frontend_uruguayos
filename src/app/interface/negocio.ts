export interface Negocio {
    id_negocio: number;
    nombre: string;
    descripcion: string;
    direccion?: string;
    latitud?: number;
    longitud?: number;
    tipoRedSocial?: string;
    urlRedSocial?: string;
    categoria: string;
    seleccionado?: boolean;
    distancia?: number;
  }