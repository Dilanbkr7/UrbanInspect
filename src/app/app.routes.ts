import type { Routes, Route } from '@angular/router';

import { sesionGuard, visitanteGuard } from './guards/auth.guard';

const acceso: Route['loadComponent'] = () => import('./pages/login.page').then((m) => m.LoginPage);

export const routes: Routes = [
  { path: 'login', canActivate: [visitanteGuard], loadComponent: acceso, data: { modo: 'login' } },
  { path: 'registro', canActivate: [visitanteGuard], loadComponent: acceso, data: { modo: 'registro' } },
  { path: 'recuperar', canActivate: [visitanteGuard], loadComponent: acceso, data: { modo: 'recuperar' } },
  {
    path: '',
    canActivateChild: [sesionGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./pages/inicio.page').then((m) => m.InicioPage) },
      { path: 'incidencias', loadComponent: () => import('./pages/incidencias.page').then((m) => m.IncidenciasPage) },
      { path: 'seguimiento', loadComponent: () => import('./pages/seguimiento.page').then((m) => m.SeguimientoPage) },
      { path: 'nuevo', loadComponent: () => import('./pages/nuevo.page').then((m) => m.NuevoPage) },
      { path: 'detalle/:id', loadComponent: () => import('./pages/detalle.page').then((m) => m.DetallePage) },
      { path: 'cuenta', loadComponent: () => import('./pages/cuenta.page').then((m) => m.CuentaPage) },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
