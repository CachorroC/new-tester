import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';

export const prisma = new PrismaClient();

async function fetcher(
  idProceso: number
) {
  try {
    const request = await fetch(
      `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Proceso/Detalle/${ idProceso }`,
    );

    if ( !request.ok ) {
      throw new Error(
        `${ idProceso }: ${ request.status } ${ request.statusText }${ JSON.stringify(
          request,
          null,
          2,
        ) }`,
      );
    }

    return await request.json() ;

  } catch ( error ) {
    console.log(
      error
    );
    return [];
  }
}

async function getIdProcesos() {
  const carpetas = await prisma.carpeta.findMany();
  return carpetas.flatMap(
    (
      carpeta
    ) => {
      return carpeta.idProcesos;
    }
  );
}

async function* AsyncGenerateActuaciones(
  idProcesos: number[]
) {
  for ( const idProceso of idProcesos ) {
    const indexOf = idProcesos.indexOf(
      idProceso
    );
    console.log(
      indexOf
    );

    const fetcherIdProceso = await fetcher(
      idProceso
    );


    yield fetcherIdProceso;
  }
}

async function main() {
  const ActsMap = [];

  const idProcesos = await getIdProcesos();
  console.log(
    idProcesos
  );

  for await ( const actuacionesJson of AsyncGenerateActuaciones(
    idProcesos
  ) ) {
    console.log(
      actuacionesJson
    );
    ActsMap.push(
      actuacionesJson
    );
  }

  fs.writeFile(
    'detallesOutput.json', JSON.stringify(
      ActsMap
    )
  );
  return ActsMap;
}

main();
