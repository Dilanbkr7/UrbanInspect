import {Component,ChangeDetectorRef,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {IonBackButton, IonButtons, IonContent, IonFooter, IonHeader, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar, ToastController} from '@ionic/angular';
import {IncidenciasService} from '../services/incidencias.service';
import {SeguimientoService} from '../services/seguimiento.service';
import {Estado, Incidencia,ESTADO_TEXTO,tipoTexto,tipoEmoji} from '../models/incidencia';
import {NavegacionComponent} from '../shared/navegacion.component';

@Component({standalone:true,selector:'app-detalle',imports:[CommonModule,FormsModule,RouterModule,NavegacionComponent,IonBackButton,IonButtons,IonContent,IonFooter,IonHeader,IonSelect,IonSelectOption,IonTextarea,IonTitle,IonToolbar],
 template:`
 <ion-header class="ion-no-border"><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/incidencias"></ion-back-button></ion-buttons>
 <ion-title>Detalle de incidencia</ion-title></ion-toolbar></ion-header>
 <ion-content><div class="contenedor">
  <p *ngIf="cargando" class="vacio">Consultando registro…</p>
  <div *ngIf="error" class="error">{{error}} <button class="boton secundario" (click)="cargar()">Reintentar</button></div>
  <ng-container *ngIf="dato as i">
   <div class="panel">
    <p class="referencia">{{i.codigo}} <span class="estado" [ngClass]="i.estado">{{estados[i.estado]}}</span></p>
    <h1 class="titulo">{{emoji(i.tipo)}} {{nombre(i.tipo)}}</h1>
    <p>{{i.descripcion}}</p><hr/>
    <dl><dt>Dirección</dt><dd>{{i.direccion}}</dd><dt>Sector</dt><dd>{{i.sector}}</dd>
    <dt>Fecha</dt><dd>{{i.fecha | date:'dd/MM/yyyy HH:mm'}}</dd>
    <dt>Prioridad</dt><dd>{{i.prioridad | titlecase}}</dd>
    <dt>Ubicación</dt><dd>{{i.latitud != null && i.longitud != null ? i.latitud + ', ' + i.longitud : 'No registrada'}}</dd>
    <dt>Observación</dt><dd>{{i.observacion || 'Sin observación'}}</dd></dl>
    <div *ngIf="i.fotoUrl"><h2>Evidencia fotográfica</h2><img [src]="i.fotoUrl" class="foto" alt="Fotografía permanente de la incidencia" /></div>
    <p *ngIf="!i.fotoUrl" class="ayuda">Sin evidencia fotográfica.</p>
    <button class="boton secundario" (click)="alternar()">{{favoritos.tiene(i.codigo) ? '★ Quitar seguimiento' : '☆ Marcar seguimiento'}}</button>
   </div>
   <div class="panel"><h2>Actualizar estado en el servicio</h2>
    <p *ngIf="i.estado==='resuelta'" class="exito">Caso resuelto. No está permitido regresar a estados anteriores.</p>
    <ng-container *ngIf="i.estado!=='resuelta'">
      <p class="ayuda">Pendiente → En proceso o Resuelta; En proceso → Resuelta.</p>
      <label class="campo" for="estado">Nuevo estado</label>
      <ion-select id="estado" interface="action-sheet" [(ngModel)]="destino" placeholder="Selecciona el nuevo estado">
       <ion-select-option *ngIf="i.estado==='pendiente'" value="en_proceso">En proceso</ion-select-option>
       <ion-select-option value="resuelta">Resuelta</ion-select-option>
      </ion-select>
      <ng-container *ngIf="destino==='resuelta'"><label class="campo" for="obs">Observación obligatoria *</label>
        <ion-textarea id="obs" [(ngModel)]="observacion" [autoGrow]="true" placeholder="Describe cómo se resolvió"></ion-textarea>
      </ng-container>
      <p *ngIf="mensaje" class="error">{{mensaje}}</p>
      <button class="boton" (click)="actualizar()" [disabled]="procesando || !destino">{{procesando?'Guardando…':'Confirmar actualización'}}</button>
    </ng-container>
   </div>
  </ng-container>
 </div></ion-content><ion-footer class="ion-no-border"><app-navegacion></app-navegacion></ion-footer>
 `,styleUrls:['./detalle.page.scss']})
export class DetallePage {
 private readonly cdr = inject(ChangeDetectorRef);
 dato:Incidencia|null=null;error='';mensaje='';cargando=false;procesando=false;
 destino:Estado | ''='';observacion='';estados=ESTADO_TEXTO;nombre=tipoTexto;emoji=tipoEmoji;
 constructor(private ruta:ActivatedRoute,private api:IncidenciasService,
  public favoritos:SeguimientoService,private toasts:ToastController){}
 ionViewWillEnter(){void this.cargar();}
 async cargar(){this.cargando=true;this.error='';this.mensaje='';
  try {await this.favoritos.inicializar();this.dato=await this.api.porId(this.ruta.snapshot.paramMap.get('id') || '');this.destino='';}
  catch{this.error='No se pudo abrir la incidencia. Revisa la conexión o el código.';this.dato=null;}
  finally{this.cargando=false;this.cdr.markForCheck();}
 }
 async alternar(){if(!this.dato)return;
   try{await this.favoritos.alternar(this.dato.codigo);}catch{this.mensaje='No se pudo guardar en este dispositivo.';}
 }
 async actualizar(){if(!this.dato || !this.destino || this.procesando)return;
   this.mensaje='';
   if(this.destino==='resuelta' && !this.observacion.trim()) {
     this.mensaje='La observación es obligatoria para marcar como resuelta.';return;
   }
   this.procesando=true;
   try {this.dato=await this.api.actualizarEstado(this.dato.id,this.destino,this.observacion);
      this.destino='';this.observacion='';
      const toast=await this.toasts.create({message:'Estado actualizado en MockAPI',duration:2200,color:'success'});await toast.present();
   } catch(e){this.mensaje=e instanceof Error?e.message:'Falló la actualización en el servicio.';}
   finally{this.procesando=false;this.cdr.markForCheck();}
 }
}
