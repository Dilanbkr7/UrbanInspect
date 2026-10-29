import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Borrador } from '../models/incidencia';

@Injectable({providedIn:'root'})
export class BorradorService {
  private readonly CLAVE = 'urbaninspect_borrador_v1';
  private readonly ARCHIVO = 'urbaninspect/borrador.jpg';

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
