import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({providedIn:'root'})
export class SeguimientoService {
  private readonly CLAVE = 'urbaninspect_seguimiento_codigos_v1';
  readonly codigos = signal<string[]>([]);
  private inicio?: Promise<void>;

  inicializar(): Promise<void> {
    this.inicio ??= (async () => {
      try {
        const {value} = await Preferences.get({key:this.CLAVE});
        const datos: unknown = value ? JSON.parse(value) : [];
        this.codigos.set(Array.isArray(datos) ? datos.filter((x):x is string=>typeof x==='string') : []);
      } catch (error) {
        this.inicio = undefined;
        throw error;
      }
    })();
    return this.inicio;
  }
  tiene(codigo:string) {return this.codigos().includes(codigo);}
  async alternar(codigo: string): Promise<void> {
    await this.inicializar();
    const siguiente = this.tiene(codigo)
      ? this.codigos().filter(c=>c!==codigo)
      : [...this.codigos(),codigo];
    await Preferences.set({key:this.CLAVE,value:JSON.stringify(siguiente)});
    this.codigos.set(siguiente);
    // No se envía absolutamente ningún cambio al servicio REST.
  }
}
