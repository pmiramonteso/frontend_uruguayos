export interface Blog {
    id_blog: number;
    titulo: string;
    contenido: string;
    autor?: string;
    categoria: string;
    photo?: string;
    status: boolean;
  }
