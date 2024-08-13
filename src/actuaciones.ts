import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import { ConsultaActuacion, outActuacion } from './types/actuaciones';

export const prisma = new PrismaClient();

async function fetcher(
  idProceso: number
) {
  try {
    const request = await fetch(
      `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Proceso/Actuaciones/${ idProceso }`,
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

    const json = ( await request.json() ) as ConsultaActuacion;

    const {
      actuaciones
    } = json;

    return actuaciones.map(
      (
        actuacion
      ) => {
        return {
          ...actuacion,
          fechaActuacion: new Date(
            actuacion.fechaActuacion
          ),
          fechaRegistro: new Date(
            actuacion.fechaRegistro
          ),
          fechaInicial: actuacion.fechaInicial
            ? new Date(
              actuacion.fechaInicial
            )
            : null,
          fechaFinal: actuacion.fechaFinal
            ? new Date(
              actuacion.fechaFinal
            )
            : null,
          isUltimaAct: actuacion.cant === actuacion.consActuacion
            ? true
            : false,
          idProceso: idProceso,
        };
      }
    );
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
      return carpeta.idProcesos.map(
        (
          idProceso
        ) => {
          return {
            idProceso,
            numero: carpeta.numero
          };
        }
      );
    }
  );
}

async function* AsyncGenerateActuaciones(
  procesos: {idProceso: number, numero: number}[]
) {
  for ( const {
    idProceso
  } of procesos ) {

    const fetcherIdProceso = await fetcher(
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

async function prismaUpdaterActuaciones(
  actuacionesComplete: outActuacion[]
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

      try {
        await prisma.actuacion.update(
          {
            where: {
              idRegActuacion: carpeta.idRegUltimaAct ?? undefined,
            },
            data: {
              isUltimaAct: false,
            },
          }
        );
      } catch ( error ) {
        console.log(
          error
        );
      }

      try {
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
      } catch ( error ) {
        console.log(
          error
        );
      }

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

async function main() {
  const ActsMap = [];

  const idProcesos = await getIdProcesos();


  for await ( const actuacionesJson of AsyncGenerateActuaciones(
    idProcesos
  ) ) {

    ActsMap.push(
      actuacionesJson
    );
  }

  fs.writeFile(
    'actuacionesOutput.json', JSON.stringify(
      ActsMap, null, 2
    )
  );
  return ActsMap;
}

main();
