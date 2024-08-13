import { Carpetas } from '../data/carpetas';
import * as fs from 'fs/promises';

const names = [];

for ( const carpeta of Carpetas ) {
  const nombre = carpeta.DEMANDADO_NOMBRE.normalize(
    'NFD' 
  );
  names.push(
    nombre 
  );

  const query = nombre.search(
    /(soni+)/gim 
  );

  if ( query >= 0 ) {
    console.log(
      query 
    );
  }
}

fs.writeFile(
  'nombres.json', JSON.stringify(
    names 
  ) 
);
