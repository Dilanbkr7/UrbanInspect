
import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  AlertController,
  ToastController
} from '@ionic/angular';

import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

import {
  Borrador,
  NuevaIncidencia,
  Prioridad,
  TipoIncidencia,
  TIPOS
} from '../models/incidencia';

import { IncidenciasService } from '../services/incidencias.service';
import { BorradorService } from '../services/borrador.service';
import { ClimaService, CondicionClima } from '../services/clima.service';
import { FotosService } from '../services/fotos.service';
import { NavegacionComponent } from '../shared/navegacion.component';

interface Formulario {
  tipo: TipoIncidencia | '';
  descripcion: string;
  direccion: string;
  sector: string;
  prioridad: Prioridad;
  latitud: number | null;
  longitud: number | null;
}

const limpio = (): Formulario => ({
  tipo: '',
  descripcion: '',
  direccion: '',
  sector: '',
  prioridad: 'media',
  latitud: null,
  longitud: null
});

@Component({
  standalone: true,
  selector: 'app-nuevo',
  imports: [
    CommonModule,
    FormsModule,
    NavegacionComponent,
    IonContent,
    IonFooter,
    IonHeader,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Nueva incidencia</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="contenedor">
        <h1 class="titulo">Registrar hallazgo</h1>
        <p class="subtitulo">
          Los datos permanecen como borrador local hasta que
          confirmes el registro.
        </p>

        <div *ngIf="error" class="error">{{error}}</div>
        <div *ngIf="aviso" class="aviso">{{aviso}}</div>

        <section class="panel">
          <h2>01 · Información de la incidencia</h2>

          <label class="campo" for="tipo">Tipo *</label>
          <ion-select
            id="tipo"
            placeholder="Selecciona el problema"
            interface="action-sheet"
            [(ngModel)]="form.tipo"
            (ngModelChange)="cambio()">
            <ion-select-option
              *ngFor="let t of tipos"
              [value]="t.value">
              {{t.emoji}} {{t.label}}
            </ion-select-option>
          </ion-select>

          <label class="campo" for="descripcion">Descripción *</label>
          <ion-textarea
            id="descripcion"
            [autoGrow]="true"
            rows="3"
            [(ngModel)]="form.descripcion"
            (ngModelChange)="cambio()"
            placeholder="Describe el daño o inconveniente">
          </ion-textarea>

          <label class="campo" for="direccion">Dirección *</label>
          <ion-input
            id="direccion"
            [(ngModel)]="form.direccion"
            (ngModelChange)="cambio()"
            placeholder="Calle principal e intersección">
          </ion-input>

          <label class="campo" for="sector">Sector *</label>
          <ion-input
            id="sector"
            [(ngModel)]="form.sector"
            (ngModelChange)="cambio()"
            placeholder="Barrio / parroquia">
          </ion-input>

          <label class="campo" for="prioridad">Prioridad *</label>
          <ion-select
            id="prioridad"
            interface="popover"
            [(ngModel)]="form.prioridad"
            (ngModelChange)="cambio()">
            <ion-select-option value="baja">Baja</ion-select-option>
            <ion-select-option value="media">Media</ion-select-option>
            <ion-select-option value="alta">Alta</ion-select-option>
          </ion-select>

          <p *ngIf="form.prioridad === 'alta'" class="aviso">
            La prioridad alta requiere fotografía antes de guardar.
          </p>
        </section>

        <section class="panel">
          <h2>02 · Ubicación del hallazgo</h2>

          <p class="ayuda">
            GPS o coordenadas manuales. Para baches es obligatorio
            registrar coordenadas válidas.
          </p>

          <button
            type="button"
            class="boton secundario"
            (click)="obtenerGPS()"
            [disabled]="buscandoGPS">
            {{buscandoGPS ? 'Obteniendo ubicación…' : '◎ Obtener GPS actual'}}
          </button>

          <div class="fila">
            <div>
              <label class="campo" for="lat">
                Latitud (-90 a 90)
              </label>
              <ion-input
                id="lat"
                type="number"
                inputmode="decimal"
                [(ngModel)]="form.latitud"
                (ngModelChange)="cambio()"
                placeholder="-0.220164">
              </ion-input>
            </div>

            <div>
              <label class="campo" for="lon">
                Longitud (-180 a 180)
              </label>
              <ion-input
                id="lon"
                type="number"
                inputmode="decimal"
                [(ngModel)]="form.longitud"
                (ngModelChange)="cambio()"
                placeholder="-78.512327">
              </ion-input>
            </div>
          </div>

          <p class="ayuda">
            Los decimales deben ingresarse con punto.
            Ejemplo Quito: latitud -0.22, longitud -78.51.
            No se asignan automáticamente.
          </p>
        </section>

        <section class="panel">
          <h2>03 · Evidencia fotográfica</h2>

          <p class="ayuda">
            Fotografía obligatoria para prioridad alta;
            opcional en otros casos.
          </p>

          <div class="fila">
            <button
              type="button"
              class="boton secundario"
              (click)="capturar()">
              {{esDispositivoNativo
                ? '📷 Tomar fotografía'
                : '📁 Elegir fotografía'}}
            </button>

            <button
              type="button"
              *ngIf="fotoBase64 || fotoGuardadaUrl"
              class="boton peligro"
              (click)="quitarFoto()">
              Quitar foto
            </button>
          </div>

          <div
            *ngIf="fotoBase64 || fotoGuardadaUrl"
            class="previsualizacion">
            <img
              [src]="fotoBase64
                ? 'data:image/jpeg;base64,' + fotoBase64
                : fotoGuardadaUrl"
              alt="Previsualización de evidencia"/>

            <p class="ayuda">
              Vista previa: la imagen se alojará externamente
              al confirmar el registro.
            </p>
          </div>

          <div
            *ngIf="!fotoBase64 && !fotoGuardadaUrl"
            class="ausencia">
            Sin fotografía seleccionada
          </div>
        </section>

        <section class="panel">
          <h2>04 · Condiciones meteorológicas y envío</h2>

          <p class="ayuda">
            Primero validamos los campos y consultamos Open-Meteo.
            Después puedes revisar las condiciones y guardar.
          </p>

          <button
            class="boton secundario"
            (click)="preparar()"
            [disabled]="preparando || guardando">
            {{preparando
              ? 'Consultando clima real…'
              : '☁ Validar y consultar clima'}}
          </button>

          <div *ngIf="preparado" class="resultado-clima">
            <ng-container *ngIf="clima as c">
              <h3>{{c.descripcion}}</h3>

              <div class="medidas">
                <div>
                  <strong>
                    {{c.temperatura | number:'1.0-1'}} °C
                  </strong>
                  <span>Temperatura actual</span>
                </div>

                <div>
                  <strong>
                    {{c.precipitacionHora | number:'1.0-2'}} mm
                  </strong>
                  <span>Precipitación de la hora anterior</span>
                </div>
              </div>

              <p class="ayuda">
                Datos consultados a Open-Meteo.
                Hora de referencia:
                {{c.horaPeriodo | date:'dd/MM HH:mm':'UTC'}} UTC.
              </p>

              <div *ngIf="c.advertencia" class="aviso">
                <b>Advertencia:</b>
                la precipitación supera 5 mm en una hora y
                podría dificultar el mantenimiento.
                Se permite continuar.
              </div>
            </ng-container>

            <p *ngIf="!clima" class="aviso">
              {{resultadoClima}}
            </p>

            <p class="exito">
              Validación completada. Puedes confirmar el registro.
            </p>

            <button
              class="boton boton-final"
              (click)="guardar()"
              [disabled]="guardando">
              {{guardando
                ? 'Guardando en oficina…'
                : '✓ Confirmar y guardar incidencia'}}
            </button>
          </div>
        </section>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <app-navegacion></app-navegacion>
    </ion-footer>
  `,
  styleUrls: ['./nuevo.page.scss']
})
export class NuevoPage implements OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly esDispositivoNativo = Capacitor.isNativePlatform();

  tipos = TIPOS;
  form: Formulario = limpio();

  error = '';
  aviso = '';
  resultadoClima = '';

  fotoBase64 = '';
  fotoGuardadaUrl = '';

  buscandoGPS = false;
  preparando = false;
  guardando = false;
  preparado = false;

  clima: CondicionClima | null = null;

  private timer: ReturnType<typeof setTimeout> | undefined;
  private tieneCambios = false;
  private restaurando = false;
  private claveVerificada = '';
  private fechaVerificacion = 0;
  private iniciada = false;

  constructor(
    private api: IncidenciasService,
    private draft: BorradorService,
    private meteo: ClimaService,
    private fotos: FotosService,
    private alertas: AlertController,
    private toasts: ToastController,
    private router: Router,
    private ruta: ActivatedRoute
  ) {}

  async ionViewWillEnter() {
    if (this.iniciada) return;

    this.iniciada = true;

    const guardado = await this.draft.obtener();

    if (!guardado) return;

    if (this.ruta.snapshot.queryParamMap.get('recuperar') === '1') {
      await this.recuperar(guardado);
      return;
    }

    const alerta = await this.alertas.create({
      header: 'Borrador encontrado',
      message: '¿Continuar el registro incompleto o descartarlo?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Descartar',
          role: 'destructive',
          handler: () => {
            void this.descartarBorrador();
          }
        },
        {
          text: 'Continuar',
          handler: () => {
            void this.recuperar(guardado);
          }
        }
      ]
    });

    await alerta.present();
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);

    if (this.tieneCambios && !this.guardando) {
      void this.persistir();
    }
  }

  ionViewWillLeave() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    if (this.tieneCambios && !this.guardando) {
      void this.persistir();
    }
  }

  private async recuperar(d: Borrador) {
    this.restaurando = true;

    this.form = {
      tipo: d.tipo,
      descripcion: d.descripcion,
      direccion: d.direccion,
      sector: d.sector,
      prioridad: d.prioridad,
      latitud: d.latitud,
      longitud: d.longitud
    };

    this.fotoGuardadaUrl = d.fotoGuardadaUrl ?? '';

    if (d.tieneFoto) {
      this.fotoBase64 = (await this.draft.leerFoto()) ?? '';

      if (!this.fotoBase64 && !this.fotoGuardadaUrl) {
        this.aviso =
          'No fue posible recuperar la fotografía del borrador. Toma una nueva si es obligatoria.';
      }
    }

    this.tieneCambios = true;
    this.restaurando = false;
    this.cdr.markForCheck();
  }

  private async descartarBorrador() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    await this.draft.descartar();

    this.form = limpio();
    this.fotoBase64 = '';
    this.fotoGuardadaUrl = '';

    this.tieneCambios = false;
    this.preparado = false;
    this.error = '';
    this.aviso = '';

    this.clima = null;
    this.resultadoClima = '';

    this.cdr.markForCheck();
  }

  cambio() {
    if (this.restaurando) return;

    this.tieneCambios = true;
    this.preparado = false;
    this.clima = null;
    this.error = '';
    this.aviso = '';

    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      void this.persistir();
    }, 350);
  }

  private async persistir() {
    if (!this.tieneCambios) return;

    try {
      const borrador: Borrador = {
        ...this.form,
        fotoGuardadaUrl: this.fotoGuardadaUrl,
        tieneFoto: !!this.fotoBase64,
        guardadoEn: new Date().toISOString()
      };

      await this.draft.guardar(borrador);
    } catch {
      this.aviso =
        'No se pudo guardar el borrador local. Mantén abierta la aplicación.';
    } finally {
      this.cdr.markForCheck();
    }
  }

  private validaCoordenada(
    valor: unknown,
    minimo: number,
    maximo: number
  ): boolean {
    return valor !== null &&
      valor !== undefined &&
      valor !== '' &&
      Number.isFinite(Number(valor)) &&
      Number(valor) >= minimo &&
      Number(valor) <= maximo;
  }

  private coordenadas(): { lat: number; lon: number } | null {
    if (
      this.validaCoordenada(this.form.latitud, -90, 90) &&
      this.validaCoordenada(this.form.longitud, -180, 180)
    ) {
      return {
        lat: Number(this.form.latitud),
        lon: Number(this.form.longitud)
      };
    }

    return null;
  }

  private ubicacionParcial(): boolean {
    return (
      this.form.latitud != null &&
      String(this.form.latitud).trim() !== ''
    ) || (
      this.form.longitud != null &&
      String(this.form.longitud).trim() !== ''
    );
  }

  private validar(): string {
    if (!this.form.tipo) {
      return 'Selecciona un tipo de incidencia.';
    }

    if (!this.form.descripcion.trim()) {
      return 'Escribe una descripción del daño.';
    }

    if (!this.form.direccion.trim()) {
      return 'Ingresa la dirección.';
    }

    if (!this.form.sector.trim()) {
      return 'Ingresa el sector.';
    }

    if (!['baja', 'media', 'alta'].includes(this.form.prioridad)) {
      return 'La prioridad no es válida.';
    }

    if (
      this.form.prioridad === 'alta' &&
      !this.fotoBase64 &&
      !this.fotoGuardadaUrl
    ) {
      return 'La prioridad alta exige fotografía. Captúrala y vuelve a intentar.';
    }

    if (this.ubicacionParcial() && !this.coordenadas()) {
      return 'Las coordenadas ingresadas están incompletas o fuera del rango válido.';
    }

    if (this.form.tipo === 'bache' && !this.coordenadas()) {
      return 'Para baches es obligatorio ingresar coordenadas válidas: GPS o manuales.';
    }

    return '';
  }

  private claveActual(): string {
    return JSON.stringify({
      form: this.form,
      foto: !!(this.fotoBase64 || this.fotoGuardadaUrl)
    });
  }

  async obtenerGPS() {
    this.error = '';
    this.aviso = '';
    this.buscandoGPS = true;

    try {
      const posicion = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      this.form.latitud = Number(
        posicion.coords.latitude.toFixed(6)
      );

      this.form.longitud = Number(
        posicion.coords.longitude.toFixed(6)
      );

      this.cambio();
      this.aviso = 'Ubicación GPS obtenida correctamente.';
    } catch {
      this.aviso =
        'GPS no disponible o permiso denegado. Puedes ingresar las coordenadas manualmente; para baches son obligatorias.';
    } finally {
      this.buscandoGPS = false;
      this.cdr.markForCheck();
    }
  }

  async capturar() {
    this.error = '';
    this.aviso = '';

    try {
      const foto = await Camera.getPhoto({
        quality: 67,
        width: 1600,
        source: this.esDispositivoNativo
          ? CameraSource.Camera
          : CameraSource.Photos,
        resultType: CameraResultType.Base64,
        allowEditing: false,
        saveToGallery: false,
        webUseInput: true
      });

      if (!foto.base64String) {
        throw new Error('No se recibieron los datos de la fotografía.');
      }

      await this.draft.guardarFoto(foto.base64String);

      this.fotoBase64 = foto.base64String;
      this.fotoGuardadaUrl = '';

      this.cambio();
      await this.persistir();
    } catch (e) {
      const mensaje = String(e).toLowerCase();

      if (
        mensaje.includes('cancel') ||
        mensaje.includes('dismiss')
      ) {
        this.aviso =
          'Selección cancelada; los demás datos se conservaron.';
      } else if (
        mensaje.includes('denied') ||
        mensaje.includes('permission')
      ) {
        this.error = this.esDispositivoNativo
          ? 'Permiso de cámara denegado. Habilítalo en los ajustes del teléfono. No se puede registrar prioridad alta sin evidencia.'
          : 'El navegador no permitió seleccionar la fotografía. Revisa sus permisos.';
      } else {
        this.error =
          'No se pudo capturar o conservar la fotografía. Revisa los permisos y el espacio disponible.';
      }
    } finally {
      this.cdr.markForCheck();
    }
  }

  async quitarFoto() {
    this.fotoBase64 = '';
    this.fotoGuardadaUrl = '';

    await this.draft.borrarFoto();

    this.cambio();
    this.cdr.markForCheck();
  }

  async preparar() {
    if (this.preparando || this.guardando) return;

    this.error = this.validar();
    this.aviso = '';

    if (this.error) {
      this.preparado = false;
      return;
    }

    this.preparando = true;
    this.preparado = false;
    this.clima = null;

    const claveAlInicio = this.claveActual();
    const coord = this.coordenadas();

    try {
      if (!coord) {
        this.resultadoClima =
          'No se indicó ubicación. Como no es un bache, se permite el registro con dirección, pero no puede consultarse el clima sin coordenadas.';
      } else {
        try {
          this.clima = await this.meteo.consultar(
            coord.lat,
            coord.lon
          );

          this.resultadoClima = '';
        } catch {
          this.resultadoClima =
            'Servicio meteorológico inaccesible o sin datos completos. Se informa el fallo, pero puedes guardar igualmente.';
        }
      }

      if (claveAlInicio !== this.claveActual()) {
        this.error =
          'Cambiaste el formulario durante la consulta. Vuelve a validar.';
        return;
      }

      this.claveVerificada = claveAlInicio;
      this.fechaVerificacion = Date.now();
      this.preparado = true;
    } finally {
      this.preparando = false;
      this.cdr.markForCheck();
    }
  }

  async guardar() {
    if (this.guardando) return;

    this.error = this.validar();

    if (this.error) return;

    if (
      !this.preparado ||
      this.claveVerificada !== this.claveActual()
    ) {
      this.error =
        'Los datos cambiaron después de consultar el clima. Vuelve a validar y consultar.';
      this.preparado = false;
      return;
    }

    if (Date.now() - this.fechaVerificacion > 3 * 60 * 1000) {
      this.error =
        'La información del clima caducó (3 minutos). Vuelve a consultar antes de guardar.';
      this.preparado = false;
      return;
    }

    this.guardando = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    try {
      if (this.fotoBase64 && !this.fotoGuardadaUrl) {
        this.fotoGuardadaUrl = await this.fotos.subirBase64(
          this.fotoBase64
        );

        await this.persistir();
      }

      const coord = this.coordenadas();

      const nuevo: NuevaIncidencia = {
        codigo: `UI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        tipo: this.form.tipo as TipoIncidencia,
        descripcion: this.form.descripcion.trim(),
        direccion: this.form.direccion.trim(),
        sector: this.form.sector.trim(),
        prioridad: this.form.prioridad,
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        fotoUrl: this.fotoGuardadaUrl,
        latitud: coord?.lat ?? null,
        longitud: coord?.lon ?? null,
        observacion: ''
      };

      await this.api.crear(nuevo);

      this.tieneCambios = false;
      await this.draft.descartar();

      this.form = limpio();
      this.fotoBase64 = '';
      this.fotoGuardadaUrl = '';
      this.preparado = false;

      const toast = await this.toasts.create({
        message: `Incidencia ${nuevo.codigo} registrada`,
        duration: 2600,
        color: 'success'
      });

      await toast.present();
      await this.router.navigateByUrl('/incidencias');
    } catch (e) {
      this.error = e instanceof Error
        ? `No se completó el guardado: ${e.message}`
        : 'No se completó el guardado en la API.';

      this.preparado = false;
      await this.persistir();
    } finally {
      this.guardando = false;
      this.cdr.markForCheck();
    }
  }
}
