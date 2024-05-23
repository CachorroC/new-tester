import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getNombres() {
  const carpetas = await prisma.carpeta.findMany(
    {
      include: {
        deudor: true,
      },
    } 
  );
  return carpetas.map(
    (
      carpeta 
    ) => {
      return carpeta.nombre;
    } 
  );
}

async function main() {
  const idProcesos = await getNombres();
  console.log(
    idProcesos 
  );

  return idProcesos;
}

const mainer = main();

console.log(
  mainer 
);
