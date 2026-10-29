import {Routes} from '@angular/router';
export const routes:Routes=[
 {path:'',redirectTo:'inicio',pathMatch:'full'},
 {path:'inicio',loadComponent:()=>import('./pages/inicio.page').then(m=>m.InicioPage)},
 {path:'incidencias',loadComponent:()=>import('./pages/incidencias.page').then(m=>m.IncidenciasPage)},
 {path:'seguimiento',loadComponent:()=>import('./pages/seguimiento.page').then(m=>m.SeguimientoPage)},
 {path:'nuevo',loadComponent:()=>import('./pages/nuevo.page').then(m=>m.NuevoPage)},
 {path:'detalle/:id',loadComponent:()=>import('./pages/detalle.page').then(m=>m.DetallePage)},
 {path:'**',redirectTo:'inicio'}
];
