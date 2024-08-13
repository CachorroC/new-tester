import * as fs from 'fs/promises';
import { Carpetas } from '../data/carpetas';

async function mapperCarpetasToConsultaRaw() {
  const answers = [];

  for ( const carpeta of Carpetas ) {
    const {
      llaveProceso 
    } = carpeta.demanda;

    try {
      const request = await fetcher(
        llaveProceso 
      );

      fs.writeFile(
        `carpetas/${ carpeta.numero }/outputRawFetch.json`,
        JSON.stringify(
          request, null, 2 
        ),
      );
      answers.push(
        request 
      );
    } catch ( error ) {
      console.log(
        error 
      );
      answers.push(
        error 
      );
    }
  }

  return answers;
}

async function fetcher(
  llaveProceso: string 
) {
  try {
    const request = await fetch(
      `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${ llaveProceso }&SoloActivos=false&pagina=1`,
    );

    return await request.json();
  } catch ( error ) {
    console.log(
      error 
    );
    return error;
  }
}

mapperCarpetasToConsultaRaw()
  .then(
    (
      ff 
    ) => {
      fs.writeFile(
        'consultaAllFetch.json', JSON.stringify(
          ff, null, 2 
        ) 
      );
      console.log(
        ff 
      );
      return ff;
    } 
  );
