
const raiz = (process.env.MOCKAPI_URL || '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/incidencias$/, '');

if (!raiz.startsWith('https://')) {
  console.error('Debes ingresar una URL valida de MockAPI.');
  process.exit(1);
}

const limite = 5;

for (let pagina = 1; pagina <= 4; pagina++) {

  try {

    const url = new URL(`${raiz}/incidencias`);

    url.searchParams.set('page', String(pagina));
    url.searchParams.set('limit', String(limite));
    url.searchParams.set('sortBy', 'fecha');
    url.searchParams.set('order', 'desc');

    const respuesta = await fetch(url);

    if (respuesta.status === 404 && pagina > 1) {
      console.log('No existen mas paginas.');
      break;
    }

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    const registros = await respuesta.json();

    if (!Array.isArray(registros)) {
      throw new Error('La API no devolvio una lista.');
    }

    console.log(
      `Pagina ${pagina}: ${registros.length} incidencias`
    );

    if (registros.length < limite) {
      console.log('Fin de los registros disponibles.');
      break;
    }

  } catch (error) {

    console.error('Error al consultar MockAPI:', error.message);
    process.exit(1);

  }
}
