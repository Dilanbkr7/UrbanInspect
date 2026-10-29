import {Component,OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {IonApp, IonRouterOutlet, AlertController} from '@ionic/angular';
import {BorradorService} from './services/borrador.service';
import {SeguimientoService} from './services/seguimiento.service';

@Component({selector:'app-root',standalone:true,imports:[IonApp,IonRouterOutlet],template:'<ion-app><ion-router-outlet></ion-router-outlet></ion-app>'})
export class AppComponent implements OnInit {
 constructor(private borrador:BorradorService,private seguimiento:SeguimientoService,
   private alertas:AlertController,private router:Router){}
 async ngOnInit() {
   try {await this.seguimiento.inicializar();} catch { /* se informa si falla al interactuar */ }
   try {
     const pendiente=await this.borrador.obtener();
     if(!pendiente) return;
     const a=await this.alertas.create({
       header:'Registro incompleto',
       message:'Hay un borrador local. ¿Deseas continuarlo o descartarlo?',
       backdropDismiss:false,
       buttons:[
         {text:'Descartar',role:'destructive',handler:()=>{void this.borrador.descartar();}},
         {text:'Continuar',handler:()=>{void this.router.navigate(['/nuevo'],{queryParams:{recuperar:'1'}});}}
       ]
     });
     await a.present();
   } catch { /* si el almacenamiento está inaccesible, formulario sigue utilizable */ }
 }
}
