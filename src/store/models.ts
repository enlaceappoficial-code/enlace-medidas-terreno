export interface GeneralData {
  cliente: string;
  telefono?: string;
  correo?: string;
  fecha: string;
  modo?: string; // Ej: "Completo"
  plazoEjecucionDias?: number;
  descripcionObra: string;
  notasInternas: string;
  notasCliente: string;
}

export interface MeasureItem {
  id: string;
  descripcion: string;
  tipo_medida: 'lineal' | 'area' | 'irregular' | 'volume' | 'unidad';
  cantidad: number;
  unidad: string; // m2, ml, m3, gl, un
  nota?: string; // Nota visible en PDF/Texto, no en JSON (se filtrará después)
  fotos?: string[]; // Array con hasta 6 fotos
  detalles?: any; // Para guardar lados de un polígono, por ejemplo
}

export interface Chapter {
  id: string;
  nombre: string; // Ej: "Remplazo techumbre Cocina"
  partidas: MeasureItem[];
}

export interface Project {
  id: string;
  datosGenerales: GeneralData;
  capitulos: Chapter[];
  fotos?: { id: string; uri: string; fechaCaptura: string }[];
  notas?: { id: string; contenido: string; fechaCreacion: string }[];
}

export interface EcpExport {
  origen: string;
  proyecto: Project;
}
