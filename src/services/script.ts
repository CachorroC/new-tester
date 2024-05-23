import { Carpeta, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function main(
  {
    incomingCarpeta 
  }: { incomingCarpeta: Carpeta } 
) {
  const user = await prisma.carpeta.create(
    {
      data: incomingCarpeta,
    } 
  );
  console.log(
    user 
  );
  return user;
}
