
import { Injectable, signal } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { CONFIG } from '../config/config';
import {
  Estado,
  Incidencia,
  NuevaIncidencia
} from '../models/incidencia';

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {

  readonly revision = signal(0);

  constructor(private http: HttpClient) {}

  private get url(): string {
    const base = CONFIG.mockApiBaseUrl.replace(/\/+$/, '');
    return `${base}/incidencias`;
  }

  // Consultar registros mediante paginacion remota
  async pagina(numero: number): Promise<Incidencia[]> {

    const params = new HttpParams()
      .set('page', numero)
      .set('limit', CONFIG.pageSize)
      .set('sortBy', 'fecha')
      .set('order', 'desc');

    try {
      const datos = await firstValueFrom(
        this.http.get<Incidencia[]>(this.url, { params })
      );

      if (!Array.isArray(datos)) {
        throw new Error(
          'El servicio no devolvio una lista valida.'
        );
      }

      return datos;

    } catch (error) {

      // Una pagina posterior inexistente indica fin del listado
      if (
        numero > 1 &&
        error instanceof HttpErrorResponse &&
        error.status === 404
      ) {
        return [];
      }

      throw error;
    }
  }

  // Consultar el detalle de una incidencia
  async porId(id: string): Promise<Incidencia> {

    return firstValueFrom(
      this.http.get<Incidencia>(
        `${this.url}/${encodeURIComponent(id)}`
      )
    );
  }

  // Buscar una incidencia mediante su codigo
  async porCodigo(codigo: string): Promise<Incidencia | null> {

    const params = new HttpParams()
      .set('codigo', codigo);

    try {
      const encontrados = await firstValueFrom(
        this.http.get<Incidencia[]>(this.url, { params })
      );

      if (!Array.isArray(encontrados)) {
        return null;
      }

      return encontrados.find(
        incidencia => incidencia.codigo === codigo
      ) ?? null;

    } catch (error) {

      if (
        error instanceof HttpErrorResponse &&
        error.status === 404
      ) {
        return null;
      }

      throw error;
    }
  }

  // Registrar una nueva incidencia en MockAPI
  async crear(datos: NuevaIncidencia): Promise<Incidencia> {

    const resultado = await firstValueFrom(
      this.http.post<Incidencia>(this.url, datos)
    );

    this.revision.update(valor => valor + 1);

    return resultado;
  }

  // Actualizar el estado respetando las transiciones permitidas
  async actualizarEstado(
    id: string,
    estado: Estado,
    observacion = ''
  ): Promise<Incidencia> {

    const actual = await this.porId(id);

    const permitidos: Record<Estado, Estado[]> = {
      pendiente: ['en_proceso', 'resuelta'],
      en_proceso: ['resuelta'],
      resuelta: []
    };

    if (!permitidos[actual.estado]?.includes(estado)) {
      throw new Error(
        `Transicion no permitida desde ${actual.estado} hasta ${estado}.`
      );
    }

    if (estado === 'resuelta' && !observacion.trim()) {
      throw new Error(
        'Debe escribir una observacion para resolver la incidencia.'
      );
    }

    
    const cambios = {
      ...actual,
      estado,
      observacion: estado === 'resuelta'
        ? observacion.trim()
        : (actual.observacion ?? ''),
      actualizadoEn: new Date().toISOString()
    };


    const resultado = await firstValueFrom(
      this.http.put<Incidencia>(
        `${this.url}/${encodeURIComponent(id)}`,
        cambios
      )
    );


    this.revision.update(valor => valor + 1);

    return resultado;
  }
}
