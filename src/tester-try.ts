import { Carpetas } from './data/carpetas';
import { CarpetaBuilder } from './models/carpeta-old';
import { CarpetaRaw } from './types/carpetas';

async function myGenerator(
  carpetaRaw: CarpetaRaw 
) {
  const newCarpeta = new CarpetaBuilder(
    carpetaRaw 
  );
  console.log(
    newCarpeta 
  );

  if ( !newCarpeta.llaveProceso ) {
    return Promise.resolve(
      newCarpeta 
    );
  }

  await newCarpeta.getProcesos();
  console.log(
    newCarpeta 
  );

  if ( !newCarpeta.procesos || newCarpeta.procesos.length === 0 ) {
    return Promise.resolve(
      newCarpeta 
    );
  }

  await newCarpeta.getActuaciones();
  console.log(
    newCarpeta 
  );
  return Promise.resolve(
    newCarpeta 
  );
}

export async function pruebaIterator() {
  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    primeraCarpeta,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    segundaCarpeta,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    terceraCarpeta,
  ] = carpetas;

  const carpeta = terceraCarpeta;

  for await ( const commit of myGenerator(
    carpeta 
  ) ) {
    console.log(
      commit 
    );
  }
}

console.log(
  pruebaIterator() 
);
