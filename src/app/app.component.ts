import {Component,OnInit,effect,inject} from '@angular/core';
import {Router} from '@angular/router';
import {IonApp, IonRouterOutlet, AlertController, NavController} from '@ionic/angular';
import {BorradorService} from './services/borrador.service';
import {SeguimientoService} from './services/seguimiento.service';
import {AuthService} from './services/auth.service';

@Component({selector:'app-root',standalone:true,imports:[IonApp,IonRouterOutlet],template:'<ion-app><ion-router-outlet></ion-router-outlet></ion-app>'})
export class AppComponent implements OnInit {
 private readonly auth = inject(AuthService);
 private readonly nav = inject(NavController);
 private sesionAnterior = false;
 constructor(private borrador:BorradorService,private seguimiento:SeguimientoService,
   private alertas:AlertController,private router:Router){
   effect(() => {
     const usuario = this.auth.usuario();
     if (usuario) void this.revisarBorrador();
     else if (this.sesionAnterior) void this.nav.navigateRoot('/login', {replaceUrl:true, animated:false});
     this.sesionAnterior = !!usuario;
   });
 }
 async ngOnInit() {
   await this.auth.listo;
 }
 private async revisarBorrador() {
   try {await this.seguimiento.inicializar();} catch { /* se informa si falla al interactuar */ }
   try {
     const pendiente=await this.borrador.obtener();
     if(!pendiente || this.router.url.startsWith('/nuevo') || !this.auth.usuario()) return;
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
