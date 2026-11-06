import { Component, inject, signal } from '@angular/core';
import { IonContent, IonFooter, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { AuthService, mensajeAuth } from '../services/auth.service';
import { NavegacionComponent } from '../shared/navegacion.component';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [IonContent, IonFooter, IonHeader, IonTitle, IonToolbar, NavegacionComponent],
  template: `
    <ion-header class="ion-no-border"
      ><ion-toolbar><ion-title>Mi cuenta</ion-title></ion-toolbar></ion-header
    >
    <ion-content
      ><div class="contenedor">
        <h1 class="titulo">Tu espacio en UrbanInspect</h1>
        <p class="subtitulo">Una cuenta para cuidar nuestra ciudad.</p>
        <section class="panel perfil">
          <div class="avatar">
            {{ (auth.usuario()?.displayName || auth.usuario()?.email || 'U').charAt(0).toUpperCase() }}
          </div>
          <h2>{{ auth.usuario()?.displayName || 'Mi cuenta' }}</h2>
          <p>{{ auth.usuario()?.email }}</p>
          <span class="estado">● Sesión iniciada</span>
        </section>
        <section class="panel">
          <h2>Tu sesión</h2>
          <p class="ayuda">
            Puedes cerrar sesión cuando termines. Para volver a entrar necesitarás tu correo y contraseña.
          </p>
          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          <button class="boton" (click)="salir()" [disabled]="ocupado()">
            {{ ocupado() ? 'Cerrando sesión…' : 'Cerrar sesión' }}
          </button>
        </section>
      </div></ion-content
    ><ion-footer class="ion-no-border"><app-navegacion /></ion-footer>
  `,
  styles: [
    `
      @use '../styles/common';
      .perfil {
        text-align: center;
        padding: 30px 18px;
      }
      .avatar {
        display: grid;
        place-items: center;
        width: 65px;
        height: 65px;
        background: #e7f1f0;
        color: #235a66;
        border-radius: 50%;
        margin: 0 auto 17px;
        font-size: 26px;
        font-weight: 800;
      }
      .perfil h2 {
        font-size: 21px;
        margin: 0 0 8px;
      }
      .perfil p {
        color: #64748b;
        font-size: 14px;
        overflow-wrap: anywhere;
      }
      .estado {
        display: inline-block;
        color: #3e6a31;
        background: #eef7e9;
        padding: 7px 11px;
        border-radius: 20px;
        font-size: 11px;
        margin-top: 10px;
      }
    `,
  ],
})
export class CuentaPage {
  readonly auth = inject(AuthService);
  readonly ocupado = signal(false);
  readonly error = signal('');
  async salir(): Promise<void> {
    if (this.ocupado()) return;
    this.ocupado.set(true);
    this.error.set('');
    try {
      await this.auth.salir();
    } catch (error) {
      this.error.set(mensajeAuth(error));
    } finally {
      this.ocupado.set(false);
    }
  }
}
