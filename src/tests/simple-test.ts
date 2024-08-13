import { Carpetas } from '../data/carpetas';
import { SimpleCarpeta } from '../models/simple-carpeta';

async function carpetasTest() {
  for ( const carpeta of Carpetas ) {
    const carp = new SimpleCarpeta(
      String(
        carpeta.EXPEDIENTE 
      ),
      Number(
        carpeta.NUMERO 
      ),
      String(
        carpeta.DEMANDADO_NOMBRE 
      ),
    );
    await carp.getProcesos();
    await carp.getActuaciones();
    console.log(
      carp 
    );
  }
}

console.log(
  carpetasTest() 
);
