import { Carpetas } from '../data/carpetas';

const llaves = [];

for ( const carpeta of Carpetas ) {
  llaves.push(
    carpeta.EXPEDIENTE 
  );
}

console.log(
  llaves.toString()
    .replaceAll(
      /,/gm, '\n' 
    ) 
);
