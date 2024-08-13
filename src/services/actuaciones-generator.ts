import { actuacionesFetcher } from './actuaciones-fetch';
import { prisma, prismaUpdaterActuaciones } from './prisma-update-actuaciones';

export async function* AsyncGenerateActuaciones(
  idProcesos: number[] 
) {
  for ( const idProceso of idProcesos ) {
    const indexOf = idProcesos.indexOf(
      idProceso 
    );
    console.log(
      indexOf 
    );

    const fetcherIdProceso = await actuacionesFetcher(
      idProceso 
    );

    await prismaUpdaterActuaciones(
      fetcherIdProceso 
    );

    await prisma.actuacion.createMany(
      {
        data          : fetcherIdProceso,
        skipDuplicates: true,
      } 
    );
    yield fetcherIdProceso;
  }
}
