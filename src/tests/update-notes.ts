import { Carpetas } from '../data/carpetas';
import { Carpeta } from '../models/carpeta';
import { PrismaCarpeta } from '../models/prisma-carpeta';
console.log(
  process.env.NODE_TLS_REJECT_UNAUTHORIZED 
);

const carpetasMap = Carpetas.map(
  (
    carpeta 
  ) => {
    return new Carpeta(
      carpeta 
    );
  } 
);

async function tryAsyncCarpetas() {
  const mapCarpetas: Map<number, Carpeta> = new Map();

  for ( const carpeta of carpetasMap ) {
    mapCarpetas.set(
      carpeta.numero, carpeta 
    );

    await PrismaCarpeta.updateNotes(
      carpeta 
    );
  }

  return Array.from(
    mapCarpetas.values() 
  );
}

console.log(
  tryAsyncCarpetas() 
);
