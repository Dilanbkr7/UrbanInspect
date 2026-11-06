import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly usuario = signal<User | null>(null);
  readonly configurado = !!environment.firebase.apiKey;
  readonly listo: Promise<void>;
  private auth?: Auth;

  constructor() {
    if (!this.configurado) {
      this.listo = Promise.resolve();
      return;
    }
    this.auth = initializeAuth(initializeApp(environment.firebase), {
      persistence: browserLocalPersistence,
    });
    if (environment.authEmulator) {
      connectAuthEmulator(this.auth, environment.authEmulator, { disableWarnings: true });
    }
    this.auth.languageCode = 'es';
    onAuthStateChanged(this.auth, (usuario) => this.usuario.set(usuario));
    this.listo = this.auth.authStateReady().then(() => {
      this.usuario.set(this.auth!.currentUser);
    });
  }

  async ingresar(correo: string, clave: string): Promise<void> {
    await this.listo;
    const resultado = await signInWithEmailAndPassword(this.conexion(), correo.trim(), clave);
    this.usuario.set(resultado.user);
  }

  async registrar(nombre: string, correo: string, clave: string): Promise<void> {
    await this.listo;
    const resultado = await createUserWithEmailAndPassword(this.conexion(), correo.trim(), clave);
    await updateProfile(resultado.user, { displayName: nombre.trim() });
    this.usuario.set(resultado.user);
  }

  async recuperar(correo: string): Promise<void> {
    await sendPasswordResetEmail(this.conexion(), correo.trim());
  }

  async salir(): Promise<void> {
    await signOut(this.conexion());
    this.usuario.set(null);
  }

  private conexion(): Auth {
    if (!this.auth) throw new Error('Firebase no está configurado.');
    return this.auth;
  }
}

export function mensajeAuth(error: unknown): string {
  switch ((error as { code?: string })?.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'El correo o la contraseña no coinciden. Revisa tus datos e inténtalo de nuevo.';
    case 'auth/email-already-in-use':
      return 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.';
    case 'auth/invalid-email':
      return 'Escribe un correo electrónico válido.';
    case 'auth/weak-password':
      return 'Usa una contraseña de al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Hubo demasiados intentos. Espera unos minutos y vuelve a intentar.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar. Revisa tu conexión a internet.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada. Contacta al administrador.';
    default:
      return 'No se pudo completar la solicitud. Inténtalo nuevamente en unos minutos.';
  }
}
