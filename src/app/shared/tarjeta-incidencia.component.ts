import {Component,Input,Output,EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {Incidencia, ESTADO_TEXTO, tipoTexto, tipoEmoji} from '../models/incidencia';

@Component({
 standalone:true,selector:'app-tarjeta-incidencia',
 imports:[CommonModule,RouterModule],
 template:`
  <article class="tarjeta">
    <div class="fila superior">
      <span class="codigo">{{item.codigo}}</span>
      <span class="estado" [ngClass]="item.estado">{{estados[item.estado] || item.estado}}</span>
    </div>
    <div class="fila titular">
      <span class="emoji">{{emoji(item.tipo)}}</span>
      <h3>{{nombre(item.tipo)}}</h3>
    </div>
    <p class="descripcion">{{item.descripcion}}</p>
    <p class="detalle"><b>Dirección:</b> {{item.direccion}}</p>
    <p class="detalle"><b>Sector:</b> {{item.sector}}</p>
    <p class="detalle"><b>Fecha:</b> {{item.fecha | date:'dd/MM/yyyy HH:mm'}}</p>
    <div *ngIf="item.fotoUrl" class="foto"><img [src]="item.fotoUrl" alt="Evidencia fotográfica de la incidencia" loading="lazy"/></div>
    <div class="fila acciones">
      <a class="enlace" [routerLink]="['/detalle',item.id]">Ver detalle →</a>
      <button type="button" class="seguir" (click)="seguimiento.emit(item.codigo)" [attr.aria-label]="marcado ? 'Quitar seguimiento' : 'Marcar seguimiento'">
        {{marcado ? '★ Quitar' : '☆ Seguir'}}
      </button>
    </div>
  </article>
 `,
 styles:[`
  .tarjeta{background:white;border:1px solid #e1e7f0;border-radius:15px;padding:16px;margin-bottom:12px;box-shadow:0 3px 13px #0c37600a}
  .fila{display:flex;justify-content:space-between;align-items:center;gap:8px}
  .superior{margin-bottom:10px}.codigo{font-size:12px;font-weight:800;color:#356186;letter-spacing:.4px}
  .titular{justify-content:flex-start}.titular h3{font-size:16px;color:#132e47;margin:0;font-weight:800}.emoji{font-size:26px}
  .estado{border-radius:100px;padding:5px 9px;font-size:11px;font-weight:800;background:#e5edf5;color:#263c50}
  .pendiente{background:#fff1d3;color:#976100}.en_proceso{background:#e2edff;color:#0755a5}.resuelta{background:#d9f5e7;color:#14603a}
  .descripcion{color:#21344a;margin:10px 0;line-height:1.48}.detalle{font-size:12px;color:#566678;margin:5px 0}
  .foto img{width:100%;max-height:210px;object-fit:cover;border-radius:10px;margin-top:10px}
  .acciones{border-top:1px solid #e8edf3;margin-top:13px;padding-top:12px}
  a.enlace{text-decoration:none;color:#0962be;font-size:13px;font-weight:800}
  button.seguir{border:1px solid #ccd9e9;border-radius:9px;background:white;padding:8px 10px;color:#345b7a;font-weight:750;font-size:12px}
 `]
})
export class TarjetaIncidenciaComponent {
 @Input({required:true}) item!:Incidencia;
 @Input() marcado=false;
 @Output() seguimiento=new EventEmitter<string>();
 estados=ESTADO_TEXTO; nombre=tipoTexto; emoji=tipoEmoji;
}
