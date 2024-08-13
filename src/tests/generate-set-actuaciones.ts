import { generateCarpetas } from '../data/carpetas-generator';
import * as fs from 'fs/promises';

async function tryAsyncCarpetas() {
  const actuacionesSet = new Set();

  for await ( const carpeta of generateCarpetas() ) {
    for ( const actuacion of carpeta.actuaciones ) {
      actuacionesSet.add(
        actuacion.actuacion 
      );
    }
  }

  fs.writeFile(
    'actuacionesSet.json',
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
