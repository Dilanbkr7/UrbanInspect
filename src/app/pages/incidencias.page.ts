import {Component,ChangeDetectorRef,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent, IonTitle, IonToolbar} from '@ionic/angular';
import {IncidenciasService} from '../services/incidencias.service';
import {SeguimientoService} from '../services/seguimiento.service';
import {Incidencia} from '../models/incidencia';
import {NavegacionComponent} from '../shared/navegacion.component';
import {TarjetaIncidenciaComponent} from '../shared/tarjeta-incidencia.component';
import {CONFIG} from '../config/config';

@Component({standalone:true,selector:'app-incidencias',
 imports:[CommonModule,NavegacionComponent,TarjetaIncidenciaComponent,IonButton,IonButtons,IonContent,IonFooter,IonHeader,IonInfiniteScroll,IonInfiniteScrollContent,IonRefresher,IonRefresherContent,IonTitle,IonToolbar],
 template:`
 <ion-header class="ion-no-border"><ion-toolbar><ion-title>Incidencias</ion-title>
  <ion-buttons slot="end"><ion-button (click)="recargar()">Actualizar</ion-button></ion-buttons></ion-toolbar></ion-header>
 <ion-content>
 <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)"><ion-refresher-content></ion-refresher-content></ion-refresher>
 <div class="contenedor">
  <h1 class="titulo">Registro de incidencias</h1>
  <p class="subtitulo">Carga incremental remota, de {{limite}} en {{limite}} incidencias.</p>
  <p *ngIf="error" class="error">{{error}} <button class="boton secundario" (click)="reintentar()">Reintentar</button></p>
  <p *ngIf="inicial" class="vacio">Consultando incidencias…</p>
  <p *ngIf="!inicial && !error && elementos.length===0" class="vacio">No existen registros todavía. Puedes crear el primero.</p>
  <app-tarjeta-incidencia *ngFor="let i of elementos;trackBy:porId" [item]="i" [marcado]="favoritos.tiene(i.codigo)" (seguimiento)="alternar($event)"></app-tarjeta-incidencia>
  <p *ngIf="!hayMas && elementos.length>0" class="fin">Fin del listado · {{elementos.length}} registros obtenidos</p>
 </div>
 <ion-infinite-scroll threshold="120px" (ionInfinite)="cargarMas($event)" [disabled]="!hayMas || !!error || inicial">
   <ion-infinite-scroll-content loadingSpinner="crescent" loadingText="Cargando la siguiente página…"></ion-infinite-scroll-content>
 </ion-infinite-scroll>
 </ion-content><ion-footer class="ion-no-border"><app-navegacion></app-navegacion></ion-footer>
 `,styleUrls:['./incidencias.page.scss']})
export class IncidenciasPage {
 private readonly cdr = inject(ChangeDetectorRef);
 elementos:Incidencia[]=[];pagina=0;hayMas=true;inicial=false;cargando=false;error='';limite=CONFIG.pageSize;
 private visitado=false;
 constructor(private api:IncidenciasService, public favoritos:SeguimientoService){}
 ionViewWillEnter(){void this.favoritos.inicializar();if(!this.visitado){this.visitado=true;void this.recargar();}else{void this.recargar();}}
 porId(_:number,i:Incidencia){return i.id;}
 async recargar(){
  if(this.cargando)return;
  this.elementos=[];this.pagina=0;this.hayMas=true;this.error='';this.inicial=true;
  await this.obtenerPagina();this.inicial=false;this.cdr.markForCheck();
 }
 async refrescar(e:CustomEvent){await this.recargar();await (e.target as HTMLIonRefresherElement).complete();}
 async reintentar(){this.error='';if(this.pagina===0)await this.recargar();else await this.obtenerPagina();}
 async cargarMas(e:CustomEvent){try{await this.obtenerPagina();}finally{await (e.target as HTMLIonInfiniteScrollElement).complete();}}
 private async obtenerPagina(){
  if(this.cargando || !this.hayMas || this.error)return;
  this.cargando=true;
  try {
    const nuevos=await this.api.pagina(this.pagina+1);
    this.elementos=[...this.elementos,...nuevos];this.pagina++;
    if(nuevos.length<CONFIG.pageSize)this.hayMas=false;
  } catch {this.error='No fue posible consultar esta página. Comprueba la conexión y la API.';}
  finally{this.cargando=false;this.cdr.markForCheck();}
 }
 async alternar(codigo:string){try{await this.favoritos.alternar(codigo);}catch{this.error='Falló el almacenamiento local.';}}
}
