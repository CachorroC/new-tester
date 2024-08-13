import * as fs from 'fs/promises';
import { Despachos } from './despachos';

const mappedNames = Despachos.map(
  (
    despacho
  ) => {

    const matchOne = despacho.nombre.match(
      /JUZGADO (\d+) ([A-Z\sñúóéíá]+) de ([.A-Z\sñúóéíáü-]+)/im,
    );
    console.log(
      `matchOne: ${ JSON.stringify(
        matchOne, null, 2
      ) }`
    );

    if ( matchOne ) {
      return [
        ...matchOne,
        despacho.url
      ];
    }

    return matchOne;
  }
);
fs.writeFile(
  'despachosNombre.json', JSON.stringify(
    mappedNames, null, 2
  )
);
