import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CondicionClima {
  temperatura: number;
  precipitacionHora: number;
  descripcion: string;
  momento: Date;
  horaPeriodo: Date;
  advertencia: boolean;
}
interface ApiMeteo {
  current?: {time?:number; temperature_2m?:number;weather_code?:number};
  hourly?: {time?:number[];precipitation?:(number|null)[]};
}
const codigoClima = (n: number):string => {
  if(n===0)return 'Despejado';
  if([1,2,3].includes(n))return 'Parcialmente nublado / nublado';
  if([45,48].includes(n))return 'Niebla';
  if([51,53,55,56,57].includes(n))return 'Llovizna';
  if([61,63,65,66,67,80,81,82].includes(n))return 'Lluvia';
  if([71,73,75,77,85,86].includes(n))return 'Nieve';
  if([95,96,99].includes(n))return 'Tormenta';
  return `Código meteorológico ${n}`;
};
@Injectable({providedIn:'root'})
export class ClimaService {
  constructor(private http:HttpClient){}
  async consultar(lat:number,lon:number):Promise<CondicionClima> {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude:String(lat),longitude:String(lon),
      current:'temperature_2m,weather_code',
      hourly:'precipitation',past_hours:'3',forecast_hours:'1',
      timezone:'GMT',timeformat:'unixtime',
    };
    const datos = await firstValueFrom(this.http.get<ApiMeteo>(url,{params}));
    const ahora = datos.current?.time;
    const temperaturas = datos.current?.temperature_2m;
    const codigo = datos.current?.weather_code;
    const horas=datos.hourly?.time ?? [];
    const lluvias=datos.hourly?.precipitation ?? [];
    if(typeof ahora!=='number' || typeof temperaturas!=='number' || typeof codigo!=='number') {
      throw new Error('El proveedor meteorológico no devolvió condiciones actuales completas.');
    }
    // Precipitación horaria Open-Meteo: suma de la hora precedente (no datos futuros).
    // Se escoge la última hora cuyos datos se han completado al momento indicado por la API.
    let indice=-1;
    for(let i=0;i<horas.length;i++) {
      if(horas[i]<=ahora && (indice<0 || horas[i]>horas[indice]))indice=i;
    }
    const mm=indice>=0?lluvias[indice]:null;
    if(typeof mm!=='number' || !Number.isFinite(mm)) {
      throw new Error('No hay precipitación disponible para la última hora cerrada.');
    }
    return {
      temperatura:temperaturas,precipitacionHora:mm,descripcion:codigoClima(codigo),
      momento:new Date(ahora*1000),horaPeriodo:new Date(horas[indice]*1000),
      advertencia:mm>5,
    };
  }
}
