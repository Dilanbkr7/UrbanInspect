import { inject } from '@angular/core';
import type { CanActivateChildFn, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const sesionGuard: CanActivateChildFn = async (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;
  return auth.usuario()
    ? true
    : router.createUrlTree(['/login'], {
        queryParams: { continuar: estado.url },
      });
};

export const visitanteGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;
  return auth.usuario() ? router.createUrlTree(['/inicio']) : true;
};

export function destinoSeguro(destino: string | null): string {
  return destino && /^\/(inicio|incidencias|seguimiento|nuevo|cuenta|detalle\/[^/?#]+)([?#].*)?$/.test(destino)
    ? destino
    : '/inicio';
}
