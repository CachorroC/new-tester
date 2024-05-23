import { client } from '../services/prisma';
import * as fs from 'fs/promises';

async function getIdProcesos() {
  const carpetas = await client.carpeta.findMany();
  return carpetas.map(
    (
      carpeta 
    ) => {
      return carpeta.llaveProceso;
    } 
  );
}

async function fetchActuaciones(
  llaveProceso: string 
) {
  const request = await fetch(
    `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${ llaveProceso }&SoloActivos=false&pagina=1`,
  );

  const copyOfRequest = request.clone();
  console.log(
    request.statusText 
  );

  if ( !request.ok ) {
    return request.json();
  }

  const consultaActuaciones = await request.json();
  return {
    ConsultaProcesos: consultaActuaciones,
    Message         : copyOfRequest.statusText,
    StatusCode      : copyOfRequest.status,
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
    'outputProcedurer.json', JSON.stringify(
      objectMap 
    ) 
  );
  return objectMap;
}

console.log(
  executer() 
);
