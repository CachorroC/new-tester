import { client } from '../services/prisma';
import { ConsultaActuacion, outActuacion } from '../types/actuaciones';

export default async function getActuaciones(
  idProceso: number 
) {
  try {
    const request = await fetch(
      `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Proceso/Actuaciones/${ idProceso }`,
    );

    if ( !request.ok ) {
      const json = await request.json();
      throw new Error(
        JSON.stringify(
          json 
        ) 
      );
    }

    const consultaActuaciones = ( await request.json() ) as ConsultaActuacion;

    const {
      actuaciones 
    } = consultaActuaciones;
    return actuaciones;
  } catch ( error ) {
    console.log(
      `error in getActuaciones ${ idProceso } = ${ error }` 
    );
    return null;
  }
}

export async function updateActuaciones(
  numero: number,
  actuaciones: outActuacion[],
) {
  const [ ultimaActuacion ] = actuaciones;

  const incomingDate = new Date(
    ultimaActuacion.fechaActuacion 
  );

  const incomingYear = incomingDate.getFullYear();

  const incomingMonth = incomingDate.getMonth();

  const incomingDay = incomingDate.getDate();
  console.log(
    `${ numero } => la nueva fecha de la actuacion es: ${ new Date(
      incomingYear,
      incomingMonth,
      incomingDay,
    ) } y el timezone offset es  ${ incomingDate.getTimezoneOffset() }
          raw: ${ ultimaActuacion.fechaActuacion }`,
  );

  const {
    fecha 
  } = await client.carpeta.findFirstOrThrow(
    {
      where: {
        numero: numero,
      },
    } 
  );
  console.log(
    `la fecha guardada en prisma es: ${ fecha }` 
  );
  console.log(
    `${
      fecha && fecha < incomingDate
        ? 'la fecha en prisma  es menor que incoming date'
        : 'la fecha en prisma es mayor que incoming dt¡ate '
    }`,
  );

  if ( !fecha || fecha < incomingDate || fecha.toString() === 'Invalid Date' ) {
    /* empty */
  }
}
