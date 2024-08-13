process.env[ 'NODE_TLS_REJECT_UNAUTHORIZED' ] = '0';

export async function actuacionesFetcher(
  idProceso: number 
) {
  try {
    //ASYNC fetch actuaciones at ramaJudicial with idProceso dependencies:[idProceso]
    const request = await fetch(
      `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Proceso/Actuaciones/${ idProceso }`,
    );

    if ( !request.ok ) {
      return request.json();
    }

    return request.json();
  } catch ( error ) {
    console.log(
      error 
    );
    return null;
  }
}
