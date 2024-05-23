import { Carpetas } from '../data/carpetas';
import * as fs from 'fs/promises';

async function tryAsyncCarpetas() {
  const keysSet = new Set();

  for ( const carpeta of Carpetas ) {
    const carpetaKeys = Object.keys(
      carpeta 
    );
    carpetaKeys.forEach(
      (
        key 
      ) => {
        keysSet.add(
          key 
        );
      } 
    );
  }

  fs.writeFile(
    'keysSet.json', JSON.stringify(
      Array.from(
        keysSet 
      ) 
    ) 
  );
  return Array.from(
    keysSet 
  );
}

console.log(
  tryAsyncCarpetas() 
);
