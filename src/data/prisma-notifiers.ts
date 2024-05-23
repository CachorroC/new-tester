import { client } from '../models/newJudicial';
import { Carpetas } from './carpetas';

async function prismaNotifiersUpdater() {
  for ( const carpeta of Carpetas ) {
    const {
      demanda 
    } = carpeta;

    const {
      notificacion 
    } = demanda;

    if ( notificacion ) {
      const the291 = notificacion[ '291' ];

      if ( the291 ) {
        let newFechaAporta, newFechaRecibido;

        try {
          const {
            fechaAporta, fechaRecibido, resultado 
          } = the291;

          if ( fechaAporta ) {
            const newAporta = new Date(
              fechaAporta 
            );

            if ( newAporta.toString() === 'Invalid Date' ) {
              newFechaAporta = null;
            } else {
              newFechaAporta = newAporta;
            }
          } else {
            newFechaAporta = null;
          }

          if ( fechaRecibido ) {
            const newRecibido = new Date(
              fechaRecibido 
            );

            if ( newRecibido.toString() === 'Invalid Date' ) {
              newFechaRecibido = null;
            } else {
              newFechaRecibido = newRecibido;
            }
          } else {
            newFechaRecibido = null;
          }

          await client.notifier.create(
            {
              data: {
                tipo         : '291',
                fechaAporta  : newFechaAporta,
                fechaRecibido: newFechaRecibido,
                resultado    : resultado
                  ? resultado === 'POSITIVO'
                    ? true
                    : false
                  : null,
                notificacionId: carpeta.numero,
              },
            } 
          );
        } catch ( error ) {
          console.log(
            error 
          );
        }
      }

      const the292 = notificacion[ '292' ];

      if ( the292 ) {
        let newFechaAporta, newFechaRecibido;

        try {
          const {
            fechaAporta, fechaRecibido, resultado 
          } = the292;

          if ( fechaAporta ) {
            const newAporta = new Date(
              fechaAporta 
            );

            const stringer = newAporta.toString();
            console.log(
              stringer 
            );

            if ( stringer === 'Invalid Date' ) {
              newFechaAporta = null;
            } else {
              newFechaAporta = newAporta;
            }
          } else {
            newFechaAporta = null;
          }

          if ( fechaRecibido ) {
            const newRecibido = new Date(
              fechaRecibido 
            );

            const stringer = newRecibido.toString();
            console.log(
              stringer 
            );

            if ( stringer === 'Invalid Date' ) {
              newFechaRecibido = null;
            } else {
              newFechaRecibido = newRecibido;
            }
          } else {
            newFechaRecibido = null;
          }

          await client.notifier.create(
            {
              data: {
                tipo         : '292',
                fechaAporta  : newFechaAporta,
                fechaRecibido: newFechaRecibido,
                resultado    : resultado
                  ? resultado === 'POSITIVO'
                    ? true
                    : false
                  : null,
                notificacionId: carpeta.numero,
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
}

prismaNotifiersUpdater()
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
