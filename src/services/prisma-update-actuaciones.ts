import * as fs from 'fs/promises';
import { outActuacion } from '../types/actuaciones';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function prismaUpdaterActuaciones(
  actuacionesComplete: outActuacion[],
) {
  const [ ultimaActuacion ] = actuacionesComplete;

  try {
    const carpeta = await prisma.carpeta.findFirstOrThrow(
      {
        where: {
          llaveProceso: ultimaActuacion.llaveProceso,
        },
      } 
    );

    const incomingDate = new Date(
      ultimaActuacion.fechaActuacion 
    )
      .getTime();

    const savedDate = carpeta.fecha
      ? new Date(
        carpeta.fecha 
      )
        .getTime()
      : null;

    if ( !savedDate || savedDate < incomingDate ) {
      console.log(
        'no hay saved date o la saved date es menor que incoming date',
      );
      await prisma.carpeta.update(
        {
          where: {
            numero: carpeta.numero,
          },
          data: {
            fecha: new Date(
              ultimaActuacion.fechaActuacion 
            ),
            revisado       : false,
            ultimaActuacion: {
              connectOrCreate: {
                where: {
                  idRegActuacion: ultimaActuacion.idRegActuacion,
                },
                create: {
                  ...ultimaActuacion,
                },
              },
            },
          },
        } 
      );

      await fs.mkdir(
        `./src/date/${ new Date()
          .getFullYear() }/${ new Date()
          .getMonth() }/${ new Date()
          .getDate() }`,
        {
          recursive: true,
        },
      );

      fs.writeFile(
        `./src/date/${ new Date()
          .getFullYear() }/${ new Date()
          .getMonth() }/${ new Date()
          .getDate() }/${
          ultimaActuacion.idRegActuacion
        }.json`,
        JSON.stringify(
          ultimaActuacion 
        ),
      );
    }
  } catch ( error ) {
    console.log(
      error 
    );
  }
}
