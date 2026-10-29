import {Component,ChangeDetectorRef,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {IonContent, IonFooter, IonHeader, IonTitle, IonToolbar} from '@ionic/angular';
import {IncidenciasService} from '../services/incidencias.service';
import {SeguimientoService} from '../services/seguimiento.service';
import {Incidencia} from '../models/incidencia';
import {NavegacionComponent} from '../shared/navegacion.component';
import {TarjetaIncidenciaComponent} from '../shared/tarjeta-incidencia.component';
import {CONFIG} from '../config/config';

@Component({standalone:true,selector:'app-inicio',
 imports:[CommonModule,RouterModule,NavegacionComponent,TarjetaIncidenciaComponent,IonContent,IonFooter,IonHeader,IonTitle,IonToolbar],
 template:`
 <ion-header class="ion-no-border"><ion-toolbar><ion-title>UrbanInspect</ion-title></ion-toolbar></ion-header>
 <ion-content><div class="contenedor">
  <div class="cabecera"><div class="mini">OPERACIONES DE CAMPO · QUITO</div>
    <h1>Panel de inspección</h1><p>Registro y seguimiento de infraestructura urbana.</p>
    <a class="crear" routerLink="/nuevo">＋ Registrar incidencia</a></div>
  <div class="panel"><h2>Indicadores de la primera página remota</h2>
    <p class="ayuda">Muestra los últimos {{tamano}} registros solicitados al servicio, no el total histórico.</p>
    <div class="kpis"><div><b>{{recientes.length}}</b><span>Consultadas</span></div>
    <div><b>{{contar('pendiente')}}</b><span>Pendientes</span></div>
    <div><b>{{contar('en_proceso')}}</b><span>En proceso</span></div>
    <div><b>{{contar('resuelta')}}</b><span>Resueltas</span></div></div>
  </div>
  <div class="panel indicador"><span>★ Incidencias en seguimiento local</span><strong>{{seguir.codigos().length}}</strong></div>
  <div class="fila titulo-fila"><h2>Registros recientes</h2><a routerLink="/incidencias">Ver listado →</a></div>
  <p *ngIf="cargando" class="vacio">Consultando el servicio…</p>
  <p *ngIf="error" class="error">{{error}} <button class="boton secundario" (click)="actualizar()">Reintentar</button></p>
  <p *ngIf="!cargando && !error && recientes.length===0" class="vacio">Aún no existen incidencias en la API.</p>
  <app-tarjeta-incidencia *ngFor="let i of recientes" [item]="i" [marcado]="seguir.tiene(i.codigo)" (seguimiento)="alternar($event)"></app-tarjeta-incidencia>
 </div></ion-content><ion-footer class="ion-no-border"><app-navegacion></app-navegacion></ion-footer>
 `,styleUrls:['./inicio.page.scss']})
export class InicioPage {
 private readonly cdr = inject(ChangeDetectorRef);
 recientes:Incidencia[]=[];cargando=false;error='';tamano=CONFIG.pageSize;
 constructor(public seguir:SeguimientoService,private api:IncidenciasService){}
 ionViewWillEnter(){void this.actualizar();}
 contar(estado:string){return this.recientes.filter(i=>i.estado===estado).length;}
 async actualizar(){this.cargando=true;this.error='';try {
   await this.seguir.inicializar();this.recientes=await this.api.pagina(1);
 }catch{this.error='No fue posible consultar MockAPI. Revisa conexión y URL del servicio.';}
 finally{this.cargando=false;this.cdr.markForCheck();}}
 async alternar(codigo:string){try{await this.seguir.alternar(codigo);}catch{this.error='No se pudo guardar el seguimiento local.';}}
}
