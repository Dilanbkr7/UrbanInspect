import { Component, computed, inject, signal } from '@angular/core';
import type { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { UrlTree } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular';

import { destinoSeguro } from '../guards/auth.guard';
import { AuthService, mensajeAuth } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  readonly auth = inject(AuthService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly nav = inject(NavController);
  readonly modo = signal<'login' | 'registro' | 'recuperar'>(this.ruta.snapshot.data['modo']);
  readonly ocupado = signal(false);
  readonly visible = signal(false);
  readonly error = signal('');
  readonly enviado = signal(false);
  readonly titulo = computed(() =>
    this.modo() === 'registro'
      ? 'Tu ciudad empieza contigo.'
      : this.modo() === 'recuperar'
        ? 'Recupera tu acceso.'
        : 'Qué bueno verte de nuevo.',
  );
  nombre = '';
  correo = '';
  clave = '';
  confirmacion = '';

  ionViewDidLeave(): void {
    this.error.set('');
    this.enviado.set(false);
    this.clave = '';
    this.confirmacion = '';
    this.visible.set(false);
  }

  async enviar(form: NgForm): Promise<void> {
    if (this.ocupado() || !this.auth.configurado) return;
    this.error.set('');
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.error.set('Revisa los campos marcados antes de continuar.');
      return;
    }
    if (this.modo() === 'registro' && (this.nombre.trim().length < 2 || this.clave !== this.confirmacion)) {
      this.error.set(this.nombre.trim().length < 2 ? 'Escribe tu nombre.' : 'Las contraseñas deben coincidir.');
      return;
    }
    this.ocupado.set(true);
    try {
      if (this.modo() === 'recuperar') {
        await this.auth.recuperar(this.correo);
        this.enviado.set(true);
        return;
      }
      if (this.modo() === 'registro') await this.auth.registrar(this.nombre, this.correo, this.clave);
      else await this.auth.ingresar(this.correo, this.clave);
      const destino = destinoSeguro(this.ruta.snapshot.queryParamMap.get('continuar'));
      this.clave = '';
      this.confirmacion = '';
      await this.nav.navigateRoot(destino, { replaceUrl: true });
    } catch (error) {
      this.error.set(mensajeAuth(error));
    } finally {
      this.ocupado.set(false);
    }
  }

  enlace(ruta: string): UrlTree {
    return this.router.createUrlTree([ruta], { queryParams: this.ruta.snapshot.queryParams });
  }
}
