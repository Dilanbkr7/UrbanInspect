import { readFileSync } from 'node:fs';
const archivo = readFileSync(new URL('../src/app/config/firebase.config.ts', import.meta.url), 'utf8');
for (const campo of ['apiKey', 'authDomain', 'projectId', 'appId']) {
  const valor = archivo.match(new RegExp(campo + String.raw`\s*:\s*['\x22]([^'\x22]+)['\x22]`))?.[1];
  if (!valor || valor.startsWith('demo-') || valor.includes('esfot2026b')) {
    console.error('Falta conectar el proyecto Firebase propio: ' + campo);
    process.exit(1);
  }
}
console.log('Configuración de Firebase lista para publicar.');
