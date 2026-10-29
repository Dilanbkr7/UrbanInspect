import {Component,ChangeDetectorRef,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonTitle, IonToolbar} from '@ionic/angular';
import {IncidenciasService} from '../services/incidencias.service';
import {SeguimientoService} from '../services/seguimiento.service';
import {Incidencia} from '../models/incidencia';
import {NavegacionComponent} from '../shared/navegacion.component';
import {TarjetaIncidenciaComponent} from '../shared/tarjeta-incidencia.component';

@Component({standalone:true,selector:'app-seguimiento',imports:[CommonModule,NavegacionComponent,TarjetaIncidenciaComponent,IonButton,IonButtons,IonContent,IonFooter,IonHeader,IonTitle,IonToolbar],
 template:`
 <ion-header class="ion-no-border"><ion-toolbar><ion-title>Seguimiento local</ion-title>
 <ion-buttons slot="end"><ion-button (click)="cargar()">Actualizar</ion-button></ion-buttons></ion-toolbar></ion-header>
 <ion-content><div class="contenedor">
  <h1 class="titulo">Mis seguimientos ★</h1><p class="subtitulo">Códigos guardados exclusivamente en este dispositivo. No se modifican los datos de oficina.</p>
  <p *ngIf="cargando" class="vacio">Recuperando incidencias marcadas…</p>
  <p *ngIf="error" class="error">{{error}} <button class="boton secundario" (click)="cargar()">Reintentar</button></p>
  <p *ngIf="!cargando && !error && favoritos.codigos().length===0" class="vacio">Aún no has marcado incidencias para seguimiento.</p>
  <p *ngIf="!cargando && !error && favoritos.codigos().length>0 && elementos.length===0" class="vacio">Los códigos guardados no tienen coincidencias en la API.</p>
  <app-tarjeta-incidencia *ngFor="let i of elementos" [item]="i" [marcado]="true" (seguimiento)="quitar($event)"></app-tarjeta-incidencia>
  <div *ngIf="faltantes.length" class="aviso">Códigos no encontrados en la API: {{faltantes.join(', ')}}.</div>
 </div></ion-content><ion-footer class="ion-no-border"><app-navegacion></app-navegacion></ion-footer>
 `,styleUrls:['./seguimiento.page.scss']})
export class SeguimientoPage {
 private readonly cdr = inject(ChangeDetectorRef);
 elementos:Incidencia[]=[];faltantes:string[]=[];cargando=false;error='';
 constructor(private api:IncidenciasService,public favoritos:SeguimientoService){}
 ionViewWillEnter(){void this.cargar();}
 async cargar(){this.cargando=true;this.error='';this.faltantes=[];
  try {
   await this.favoritos.inicializar();
   const codigos=this.favoritos.codigos();
   const resultados=await Promise.allSettled(codigos.map(c=>this.api.porCodigo(c)));
   this.elementos=[];let errores=0;
   resultados.forEach((r,i)=>{
    if(r.status==='rejected')errores++;
    else if(r.value) this.elementos.push(r.value);
    else this.faltantes.push(codigos[i]);
   });
   if(errores) this.error=`No se pudieron consultar ${errores} registros. Revisa la conexión.`;
  } catch {this.error='No fue posible recuperar el seguimiento local.';}
  finally{this.cargando=false;this.cdr.markForCheck();}
 }
 async quitar(codigo:string){
  try{await this.favoritos.alternar(codigo);this.elementos=this.elementos.filter(i=>i.codigo!==codigo);this.cdr.markForCheck();}
  catch{this.error='No fue posible desmarcar la incidencia.';}
 }
}
