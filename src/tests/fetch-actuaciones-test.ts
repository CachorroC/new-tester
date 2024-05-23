import { client } from '../services/prisma';
import * as fs from 'fs/promises';
type CA = {
  actuaciones: Actuacione[];
  paginacion: Paginacion;
};
type Actuacione = {
  idRegActuacion: number;
  llaveProceso: string;
  consActuacion: number;
  fechaActuacion: Date;
  actuacion: string;
  anotacion: null | string;
  fechaInicial: Date | null;
  fechaFinal: Date | null;
  fechaRegistro: Date;
  codRegla: CodRegla;
  conDocumentos: boolean;
  cant: number;
};

type CodRegla = '00                              ';

type Paginacion = {
  cantidadRegistros: number;
  registrosPagina: number;
  cantidadPaginas: number;
  pagina: number;
  paginas: null;
};

async function getIdProcesos() {
  const carpetas = await client.carpeta.findMany();
  return carpetas.flatMap(
    (
      carpeta 
    ) => {
      return carpeta.idProcesos;
    } 
  );
}

async function fetchActuaciones(
  idProceso: number 
) {
  const request = await fetch(
    `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Proceso/Actuaciones/${ idProceso }`,
  );

  console.log(
    request.statusText 
  );

  if ( !request.ok ) {
    return {
      success  : false,
      idProceso: idProceso,
      data     : await request.json(),
    };
  }

  const consultaActuaciones = ( await request.json() ) as CA;
  return {
    idProceso: idProceso,
    data     : {
      ...consultaActuaciones,
      Message   : request.statusText,
      StatusCode: request.status,
    },
    success: true,
  };
}

async function executer() {
  const idProccesos = await getIdProcesos();
  console.log(
    `idProcesos length = ${ idProccesos.length }` 
  );

  const idsSet = new Set();

  const outputer = new Map();
  console.log(
    `outputer length before = ${ outputer.size }` 
  );

  for await ( const idProceso of idProccesos ) {
    const hasId = idsSet.has(
      idProceso 
    );

    if ( hasId ) {
      console.log(
        `ya existe la id ${ idProceso }` 
      );
    } else {
      idsSet.add(
        idProceso 
      );
    }

    const fetchActs = await fetchActuaciones(
      idProceso 
    );
    outputer.set(
      idProceso, fetchActs 
    );
  }

  console.log(
    `outputer length after = ${ outputer.size }` 
  );

  const objectMap = Array.from(
    outputer.entries() 
  );

  fs.writeFile(
    'outputExecuter.json', JSON.stringify(
      objectMap 
    ) 
  );
  return objectMap;
}

console.log(
  executer() 
);
