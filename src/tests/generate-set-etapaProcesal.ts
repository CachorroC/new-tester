import { generateCarpetas } from '../data/carpetas-generator';
import * as fs from 'fs/promises';

async function tryAsyncCarpetas() {
  const actuacionesSet = new Set();

  for await ( const carpeta of generateCarpetas() ) {
    const {
      demanda 
    } = carpeta;

    const {
      etapaProcesal 
    } = demanda;

    actuacionesSet.add(
      etapaProcesal 
    );
  }

  fs.writeFile(
    'etapaProcesalSet.json',
    JSON.stringify(
      Array.from(
        actuacionesSet 
      ) 
    ),
  );
  return Array.from(
    actuacionesSet 
  );
}

console.log(
  tryAsyncCarpetas() 
);
