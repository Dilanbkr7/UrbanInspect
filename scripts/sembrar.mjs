/** Semilla de 18 incidencias ficticias (3+ páginas de cinco). Node 20+ */
const raiz=(process.env.MOCKAPI_URL || '').replace(/\/$/,'');
if(!raiz.startsWith('https://') || raiz.includes('TU_SUBDOMINIO')) {
 console.error('Define MOCKAPI_URL=https://tu-proyecto.mockapi.io');process.exit(1);
}
const tipos=['luminaria','bache','senalizacion','alcantarilla','parque'];
const textos={
 luminaria:'Luminaria apagada o con funcionamiento intermitente',
 bache:'Hundimiento en la calzada que afecta la circulación',
 senalizacion:'Señal de tránsito con desgaste o pérdida de visibilidad',
 alcantarilla:'Sumidero con presencia de sedimentos y residuos',
 parque:'Mobiliario o sendero del parque en mal estado'
};
const sectores=['La Carolina','Iñaquito','El Ejido','Centro Histórico','La Mariscal','Carcelén'];
const calles=['Av. Amazonas y Naciones Unidas','Av. 10 de Agosto y Colón','Av. Patria y 6 de Diciembre','Guayaquil y Espejo','Av. Eloy Alfaro y República','Diego de Vásquez y Jaime Roldós'];
const total=18;
for(let n=0;n<total;n++){
 const tipo=tipos[n%5];
 const estado=['pendiente','en_proceso','resuelta'][n%3];
 const item={
  codigo:`DEMO-${String(n+1).padStart(3,'0')}`,
  tipo,descripcion:`${textos[tipo]} (registro de práctica ${n+1})`,
  direccion:calles[n%6],sector:sectores[n%6],
  prioridad:['baja','media','alta'][n%3],
  estado,fecha:new Date(Date.now()-(n+1)*3600_000).toISOString(),
  fotoUrl:'',
  latitud:-0.18-(n%6)*0.01,longitud:-78.48-(n%6)*0.01,
  observacion:estado==='resuelta'?'Atención simulada completada para demostración.':'',
 };
 try {
  const r=await fetch(`${raiz}/incidencias`,{
   method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)
  });
  if(!r.ok)throw new Error(`HTTP ${r.status} ${await r.text()}`);
  const creado=await r.json();
  console.log(`Creado ${n+1}/${total}: ${creado.codigo} (id ${creado.id})`);
 }catch(e){console.error('Error al sembrar:',e.message);process.exit(1);}
}
console.log('FINALIZADO: 18 registros nuevos. Ejecuta una sola vez para evitar duplicados.');
