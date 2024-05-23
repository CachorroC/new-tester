import { Carpetas } from './carpetas';

export const rawJuzgados = Carpetas.map(
  (
    carpeta 
  ) => {
    if ( carpeta.JUZGADO_EJECUCION ) {
      return carpeta.JUZGADO_EJECUCION;
    }

    if ( carpeta.JUZGADO_ORIGEN ) {
      return carpeta.JUZGADO_ORIGEN;
    }

    return carpeta.JUZGADO_CIUDAD;
  } 
);

console.log(
  JSON.stringify(
    rawJuzgados, null, 2 
  ) 
);
