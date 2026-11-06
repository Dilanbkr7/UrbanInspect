import { Injectable, signal, inject, effect } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from './auth.service';

@Injectable({providedIn:'root'})
export class SeguimientoService {
  private readonly auth = inject(AuthService);
  private get CLAVE() { return `urbaninspect_seguimiento_v2_${this.auth.usuario()?.uid ?? 'sin_sesion'}`; }
  readonly codigos = signal<string[]>([]);
  private inicio?: Promise<void>;
  private usuario = '';

  constructor() {
    effect(() => {
      const uid = this.auth.usuario()?.uid ?? '';
      if (uid !== this.usuario) {
        this.usuario = uid;
        this.inicio = undefined;
        this.codigos.set([]);
      }
    });
  }

  inicializar(): Promise<void> {
    const uid = this.auth.usuario()?.uid ?? '';
    if (uid !== this.usuario) {
      this.usuario = uid;
      this.inicio = undefined;
      this.codigos.set([]);
    }
    this.inicio ??= (async () => {
      try {
        const {value} = await Preferences.get({key:this.CLAVE});
        const datos: unknown = value ? JSON.parse(value) : [];
        if (uid === this.usuario) this.codigos.set(Array.isArray(datos) ? datos.filter((x):x is string=>typeof x==='string') : []);
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
