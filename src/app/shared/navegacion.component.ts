import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone:true,
  selector:'app-navegacion',
  imports:[RouterModule],
  template:`
    <nav class="navegacion" aria-label="Navegación principal">
        <a routerLink="/inicio" routerLinkActive="activo"><span>⌂</span>Inicio</a>
        <a routerLink="/incidencias" routerLinkActive="activo"><span>≡</span>Incidencias</a>
        <a routerLink="/nuevo" routerLinkActive="activo"><span>＋</span>Registrar</a>
        <a routerLink="/seguimiento" routerLinkActive="activo"><span>★</span>Seguimiento</a>
    </nav>
  `,
  styles:[`
    .navegacion{display:grid;grid-template-columns:repeat(4,1fr);padding:7px 4px max(8px,env(safe-area-inset-bottom));background:#fff;border-top:1px solid #e8edf3}
    .navegacion a{display:flex;flex-direction:column;align-items:center;gap:1px;text-decoration:none;color:#64748b;font-weight:650;font-size:10px;padding:4px 0}
    .navegacion a span{font-size:25px;line-height:28px;font-weight:700}
    .navegacion a.activo{color:#075bb6}
  `]
})
export class NavegacionComponent {}
