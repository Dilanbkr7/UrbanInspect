import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Borrador } from '../models/incidencia';
import { AuthService } from './auth.service';

@Injectable({providedIn:'root'})
export class BorradorService {
  private readonly auth = inject(AuthService);
  private get CLAVE() { return `urbaninspect_borrador_v2_${this.auth.usuario()?.uid ?? 'sin_sesion'}`; }
  private get ARCHIVO() { return `urbaninspect/${this.auth.usuario()?.uid ?? 'sin_sesion'}/borrador.jpg`; }

  async obtener(): Promise<Borrador | null> {
    const {value} = await Preferences.get({key:this.CLAVE});
    if (!value) return null;
    try {return JSON.parse(value) as Borrador;} catch {return null;}
  }
  async guardar(b: Borrador):Promise<void> {
    await Preferences.set({key:this.CLAVE,value:JSON.stringify(b)});
  }
  async guardarFoto(base64: string):Promise<void> {
    await Filesystem.writeFile({path:this.ARCHIVO, data:base64, directory:Directory.Data,recursive:true});
  }
  async leerFoto():Promise<string | null> {
    try {
      const {data} = await Filesystem.readFile({path:this.ARCHIVO,directory:Directory.Data});
      return typeof data === 'string' ? data : null;
    } catch {return null;}
  }
  async borrarFoto():Promise<void> {
    try {await Filesystem.deleteFile({path:this.ARCHIVO,directory:Directory.Data});} catch { /* no existe */ }
  }
  async descartar():Promise<void> {
    await Preferences.remove({key:this.CLAVE});
    await this.borrarFoto();
  }
}
