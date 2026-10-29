export type TipoIncidencia = 'luminaria' | 'bache' | 'senalizacion' | 'alcantarilla' | 'parque';
export type Prioridad = 'baja' | 'media' | 'alta';
export type Estado = 'pendiente' | 'en_proceso' | 'resuelta';

export interface Incidencia {
  id: string;
  codigo: string;
  tipo: TipoIncidencia;
  descripcion: string;
  direccion: string;
  sector: string;
  prioridad: Prioridad;
  fecha: string;
  estado: Estado;
  fotoUrl?: string;
  latitud?: number | null;
  longitud?: number | null;
  observacion?: string;
  actualizadoEn?: string;
}
export type NuevaIncidencia = Omit<Incidencia, 'id'>;
export const TIPOS: {value: TipoIncidencia; label: string; emoji: string}[] = [
  { value:'luminaria', label:'Luminaria dañada', emoji:'💡' },
  { value:'bache', label:'Bache en la calzada', emoji:'🚧' },
  { value:'senalizacion', label:'Señalización deteriorada', emoji:'🚦' },
  { value:'alcantarilla', label:'Alcantarilla obstruida', emoji:'🌧️' },
  { value:'parque', label:'Daños en parque', emoji:'🌳' },
];
export const ESTADO_TEXTO: Record<Estado,string> = {
  pendiente:'Pendiente', en_proceso:'En proceso', resuelta:'Resuelta'
};
export const tipoTexto = (tipo: string) => TIPOS.find(t=>t.value===tipo)?.label ?? tipo;
export const tipoEmoji = (tipo: string) => TIPOS.find(t=>t.value===tipo)?.emoji ?? '📍';

export interface Borrador {
  tipo: TipoIncidencia | '';
  descripcion: string;
  direccion: string;
  sector: string;
  prioridad: Prioridad;
  latitud: number | null;
  longitud: number | null;
  fotoGuardadaUrl: string;
  tieneFoto: boolean;
  guardadoEn: string;
}
