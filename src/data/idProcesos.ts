import { prisma } from '../services/prisma-update-actuaciones';

export async function getIdProcesos() {
  const carpetas = await prisma.carpeta.findMany();
  return carpetas.flatMap(
    (
      carpeta 
    ) => {
      return carpeta.idProcesos;
    } 
  );
}
