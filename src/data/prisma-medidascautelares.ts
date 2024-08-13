import { client } from '../models/newJudicial';
import { Carpetas } from './carpetas';

async function prismaMedidasCautelares() {
  for ( const carpeta of Carpetas ) {
    const {
      demanda 
    } = carpeta;

    const {
      medidasCautelares 
    } = demanda;

    if ( medidasCautelares ) {
      const {
        medidaSolicitada, fechaOrdenaMedidas 
      } = medidasCautelares;
      let newFechaOrdenaMedida;

      if ( fechaOrdenaMedidas ) {
        const newFecha = new Date(
          fechaOrdenaMedidas 
        );

        const stringer = newFecha.toString();

        if ( stringer === 'Invalid Date' ) {
          newFechaOrdenaMedida = null;
        } else {
          newFechaOrdenaMedida = newFecha;
        }
      } else {
        newFechaOrdenaMedida = null;
      }

      try {
        await client.medidasCautelares.create(
          {
            data: {
              medidaSolicitada: medidaSolicitada
                ? medidaSolicitada
                : null,
              fechaOrdenaMedida: newFechaOrdenaMedida,
              id               : carpeta.numero,
            },
          } 
        );
      } catch ( error ) {
        console.log(
          error 
        );
      }
    }
  }
}

prismaMedidasCautelares()
  .then(
    (
      rr 
    ) => {
      console.log(
        rr 
      );
      return rr;
    } 
  );
