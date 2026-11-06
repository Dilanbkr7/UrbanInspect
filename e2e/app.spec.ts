import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const clave = 'CiudadQuito2026!';
const correoNuevo = () => `vecino-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;

async function registrar(page: Page, correo = correoNuevo(), nombre = 'Vecino de Quito') {
  await page.goto('/registro');
  await page.getByLabel('Tu nombre', { exact: true }).filter({ visible: true }).fill(nombre);
  await page.getByLabel('Correo electrónico').filter({ visible: true }).fill(correo);
  await page.getByLabel('Contraseña', { exact: true }).filter({ visible: true }).fill(clave);
  await page.getByLabel('Confirma tu contraseña').filter({ visible: true }).fill(clave);
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  return correo;
}

async function salir(page: Page) {
  await page.getByRole('link', { name: 'Mi cuenta', exact: true }).last().click();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*.mockapi.io/**', (route) => route.fulfill({ json: [] }));
});

test('protege todas las pantallas antes de consultar reportes', async ({ page }) => {
  const consultas: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('mockapi.io')) consultas.push(request.url());
  });
  for (const ruta of ['/inicio', '/incidencias', '/nuevo', '/seguimiento', '/detalle/1', '/cuenta']) {
    await page.goto(ruta);
    await expect(page).toHaveURL(/\/login\?continuar=/);
    await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  }
  expect(consultas).toEqual([]);
});

test('registra, conserva la sesión al recargar y permite salir', async ({ page }) => {
  const correo = await registrar(page);
  await page.reload();
  await expect(page.getByText('Hola, Vecino de Quito')).toBeVisible();
  await page.goto('/login');
  await expect(page).toHaveURL(/\/inicio$/);
  await page.goto('/cuenta');
  await expect(page.getByText(correo, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/nuevo');
  await expect(page).toHaveURL(/\/login\?continuar=/);
});

test('vuelve a la ruta solicitada después de iniciar sesión', async ({ page }) => {
  const correo = await registrar(page);
  await salir(page);
  await page.goto('/seguimiento');
  await page.getByLabel('Correo electrónico').filter({ visible: true }).fill(correo);
  await page.getByLabel('Contraseña', { exact: true }).filter({ visible: true }).fill(clave);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/seguimiento$/);
});

test('rechaza claves incorrectas sin abrir pantallas privadas', async ({ page }) => {
  const correo = await registrar(page);
  await salir(page);
  await page.getByLabel('Correo electrónico').filter({ visible: true }).fill(correo);
  await page.getByLabel('Contraseña', { exact: true }).filter({ visible: true }).fill('ClaveIncorrecta');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('no coinciden');
  await expect(page).toHaveURL(/\/login$/);
});

test('valida la confirmación y detecta correos registrados', async ({ page }) => {
  const correo = await registrar(page);
  await salir(page);
  await page.getByRole('link', { name: 'Crea una cuenta' }).click();
  await expect(page.locator('app-login:visible')).toHaveCount(1);
  await page.getByLabel('Tu nombre', { exact: true }).filter({ visible: true }).fill('Otro vecino');
  await page.getByLabel('Correo electrónico').filter({ visible: true }).fill(correo);
  await page.getByLabel('Contraseña', { exact: true }).filter({ visible: true }).fill(clave);
  await page.getByLabel('Confirma tu contraseña').filter({ visible: true }).fill('OtraClave123');
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await expect(page.getByRole('alert')).toContainText('deben coincidir');
  await page.getByLabel('Confirma tu contraseña').filter({ visible: true }).fill(clave);
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await expect(page.getByRole('alert')).toContainText('ya tiene una cuenta');
});

test('solicita un enlace de recuperación a Firebase', async ({ page, request }) => {
  const correo = await registrar(page);
  await salir(page);
  await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();
  await expect(page.getByRole('heading', { name: 'Recupera tu acceso.' })).toBeVisible();
  await expect(page.locator('app-login:visible')).toHaveCount(1);
  await page.getByLabel('Correo electrónico').filter({ visible: true }).fill(correo);
  await page.getByRole('button', { name: 'Enviar enlace' }).click();
  await expect(page.getByRole('status')).toContainText('Revisa tu correo');
  const respuesta = await request.get('http://127.0.0.1:9099/emulator/v1/projects/demo-urbaninspect/oobCodes');
  const datos = await respuesta.json();
  expect(
    datos.oobCodes.some(
      (item: { email: string; requestType: string }) => item.email === correo && item.requestType === 'PASSWORD_RESET',
    ),
  ).toBe(true);
});

test('no acepta destinos externos y permite mostrar la clave', async ({ page }) => {
  const correo = await registrar(page);
  await salir(page);
  await page.goto('/login?continuar=https://example.com');
  await page.getByLabel('Correo electrónico').filter({ visible: true }).fill(correo);
  await page.getByLabel('Contraseña', { exact: true }).filter({ visible: true }).fill(clave);
  await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
  await expect(page.getByLabel('Contraseña', { exact: true }).filter({ visible: true })).toHaveAttribute(
    'type',
    'text',
  );
  await page.getByRole('button', { name: 'Ocultar contraseña' }).click();
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/inicio$/);
});

test('mantiene los borradores separados por cuenta', async ({ page }) => {
  await registrar(page, correoNuevo(), 'Primera cuenta');
  await page.getByRole('link', { name: 'Registrar', exact: true }).click();
  await page.locator('ion-textarea#descripcion textarea').fill('Borrador exclusivo de la primera cuenta');
  await page.waitForFunction(() => Object.keys(localStorage).some((key) => key.includes('borrador_v2')));
  await salir(page);
  await registrar(page, correoNuevo(), 'Segunda cuenta');
  await page.getByRole('link', { name: 'Registrar', exact: true }).click();
  await expect(page.locator('ion-textarea#descripcion textarea')).toHaveValue('');
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});

test('mantiene el formulario dentro de la pantalla', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Qué bueno verte de nuevo.' })).toBeVisible();
  const medidas = await page.evaluate(() => ({
    ancho: document.documentElement.clientWidth,
    contenido: document.documentElement.scrollWidth,
  }));
  expect(medidas.contenido).toBeLessThanOrEqual(medidas.ancho);
});
