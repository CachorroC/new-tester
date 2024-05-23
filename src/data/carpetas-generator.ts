import { Carpeta } from '../models/carpeta';
import { Carpetas } from './carpetas';

process.env[ 'NODE_TLS_REJECT_UNAUTHORIZED' ] = '0';
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

export async function* generateCarpetas() {
  for await ( const carpeta of carpetasMap ) {
    await carpeta.getProcesos();
    await carpeta.getActuaciones();
    yield carpeta;
  }
}
