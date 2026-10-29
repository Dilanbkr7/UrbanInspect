import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CONFIG } from '../config/config';

@Injectable({providedIn:'root'})
export class FotosService {
  constructor(private http:HttpClient){}
  async subirBase64(base64: string):Promise<string> {
    const {cloudinaryCloudName:cloud,preset} = {
      cloudinaryCloudName:CONFIG.cloudinaryCloudName,
      preset:CONFIG.cloudinaryUnsignedPreset
    };
    if(cloud.startsWith('TU_') || !cloud || !preset) {
      throw new Error('Configura cloudinaryCloudName y cloudinaryUnsignedPreset en config.ts.');
    }
    const formulario = new FormData();
    formulario.append('file',`data:image/jpeg;base64,${base64}`);
    formulario.append('upload_preset',preset);
    const url=`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`;
    const respuesta=await firstValueFrom(this.http.post<{secure_url?:string}>(url,formulario));
    if(!respuesta.secure_url?.startsWith('https://')) {
      throw new Error('Cloudinary no devolvió una URL segura de fotografía.');
    }
    return respuesta.secure_url;
  }
}
