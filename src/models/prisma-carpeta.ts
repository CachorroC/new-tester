import { Prisma } from '@prisma/client';
import { client } from '../services/prisma';
import { ClassDeudor } from './deudor';
import { ClassDemanda } from './demanda';
import { Carpeta } from './carpeta';

export class PrismaCarpeta {
  static async updateNotes(
    incomingCarpeta: Carpeta
  ) {
    const {
      notas
    } = incomingCarpeta;

    const updater = await client.nota.createMany(
      {
        data          : notas,
        skipDuplicates: true,
      }
    );
    console.log(
      updater
    );
    return updater.count;
  }
  static async getCarpeta(
    numero: number
  ) {
    return await client.carpeta.findFirstOrThrow(
      {
        where: {
          numero: numero,
        },
        include: {
          ultimaActuacion: true,
          deudor         : true,
          codeudor       : true,
          notas          : true,
          tareas         : true,
          demanda        : {
            include: {
              notificacion: {
                include: {
                  notifiers: true,
                },
              },
              medidasCautelares: true,
            },
          },
          procesos: {
            include: {
              juzgado: true,
            },
          },
        },
      }
    );
  }
  static async updateCarpeta(
    incomingCarpeta: Carpeta
  ) {
    const {
      ultimaActuacion, demanda, deudor, notas
    } = incomingCarpeta;

    const newDemanda = ClassDemanda.prismaDemanda(
      demanda
    );

    const newDeudor = ClassDeudor.prismaDeudor(
      deudor
    );

    const newCarpeta = Carpeta.prismaCarpeta(
      incomingCarpeta
    );

    const inserter = await client.carpeta.update(
      {
        where: {
          numero: incomingCarpeta.numero,
        },
        data: {
          category       : newCarpeta.category,
          fecha          : newCarpeta.fecha,
          terminado      : newCarpeta.terminado,
          nombre         : newCarpeta.nombre,
          notasCount     : newCarpeta.notasCount,
          ultimaActuacion: ultimaActuacion
            ? {
                connectOrCreate: {
                  where: {
                    idRegActuacion: ultimaActuacion.idRegActuacion,
                  },
                  create: {
                    ...ultimaActuacion,
                  },
                },
              }
            : undefined,
          deudor: {
            update: {
              ...newDeudor,
            },
          },
          demanda: {
            update: {
              ...newDemanda,
            },
          },
          notas: {
            createMany: {
              data          : notas,
              skipDuplicates: true,
            },
          },
        },
      }
    );
    console.log(
      inserter
    );
  }
  static async insertCarpeta(
    incomingCarpeta: Carpeta
  ) {
    const {
      ultimaActuacion,
      procesos,
      actuaciones,
      demanda,
      deudor,
      codeudor,
      notas,
    } = incomingCarpeta;

    const newDemanda = ClassDemanda.prismaDemanda(
      demanda
    );

    const newDeudor = ClassDeudor.prismaDeudor(
      deudor
    );

    const newCarpeta = Carpeta.prismaCarpeta(
      incomingCarpeta
    );

    await client.carpeta.upsert(
      {
        where: {
          numero: incomingCarpeta.numero,
        },
        create: {
          ...newCarpeta,
          juzgado: {
            connectOrCreate: {
              where: {
                id_tipo_ciudad: {
                  tipo  : incomingCarpeta.juzgado.tipo,
                  id    : incomingCarpeta.juzgado.id,
                  ciudad: incomingCarpeta.juzgado.ciudad,
                },
              },
              create: {
                tipo  : incomingCarpeta.juzgado.tipo,
                id    : incomingCarpeta.juzgado.id,
                ciudad: incomingCarpeta.juzgado.ciudad,
                url   : incomingCarpeta.juzgado.url
              },
            },
          },
          ultimaActuacion: ultimaActuacion
            ? {
                connectOrCreate: {
                  where: {
                    idRegActuacion: ultimaActuacion.idRegActuacion,
                  },
                  create: {
                    ...ultimaActuacion,
                  },
                },
              }
            : undefined,
          deudor: {
            connectOrCreate: {
              where: {
                id: incomingCarpeta.numero,
              },
              create: newDeudor,
            },
          },
          demanda: {
            connectOrCreate: {
              where: {
                id: incomingCarpeta.numero,
              },
              create: newDemanda,
            },
          },
          codeudor: {
            connectOrCreate: {
              where: {
                id: incomingCarpeta.numero,
              },
              create: {
                ...codeudor,
              },
            },
          },
          notas: {
            createMany: {
              data          : notas,
              skipDuplicates: true,
            },
          },
          procesos: {
            connectOrCreate: procesos.map(
              (
                proceso
              ) => {
                const {
                  juzgado, ...restProceso
                } = proceso;

                const procesoCreateorConnect: Prisma.ProcesoCreateOrConnectWithoutCarpetaInput
              = {
                where: {
                  idProceso: proceso.idProceso,
                },
                create: {
                  ...restProceso,
                  juzgado: {
                    connectOrCreate: {
                      where: {
                        id_tipo_ciudad: {
                          tipo  : juzgado.tipo,
                          id    : juzgado.id,
                          ciudad: juzgado.ciudad,
                        },
                      },
                      create: {
                        tipo  : juzgado.tipo,
                        id    : juzgado.id,
                        ciudad: juzgado.ciudad,
                        url   : juzgado.url
                      },
                    },
                  },
                  actuaciones: {
                    connectOrCreate: actuaciones.map(
                      (
                        actuacion
                      ) => {
                        const actuacionCreateOrConnect: Prisma.ActuacionCreateOrConnectWithoutCarpetaInput
                        = {
                          where: {
                            idRegActuacion: actuacion.idRegActuacion,
                          },
                          create: {
                            ...actuacion,
                          },
                        };
                        return actuacionCreateOrConnect;
                      }
                    ),
                  },
                },
              };

                return procesoCreateorConnect;
              }
            ),
          },
        },
        update: {
          category  : newCarpeta.category,
          terminado : newCarpeta.terminado,
          revisado  : newCarpeta.revisado,
          ciudad    : newCarpeta.ciudad,
          nombre    : newCarpeta.nombre,
          notasCount: newCarpeta.notasCount,
          juzgado   : {
            connectOrCreate: {
              where: {
                id_tipo_ciudad: {
                  tipo  : incomingCarpeta.juzgado.tipo,
                  id    : incomingCarpeta.juzgado.id,
                  ciudad: incomingCarpeta.juzgado.ciudad,
                },
              },
              create: {
                tipo  : incomingCarpeta.juzgado.tipo,
                id    : incomingCarpeta.juzgado.id,
                ciudad: incomingCarpeta.juzgado.ciudad,
                url   : incomingCarpeta.juzgado.url
              },
            },
          },
          ultimaActuacion: ultimaActuacion
            ? {
                connectOrCreate: {
                  where: {
                    idRegActuacion: ultimaActuacion.idRegActuacion,
                  },
                  create: {
                    ...ultimaActuacion,
                  },
                },
              }
            : undefined,
          demanda: {
            connectOrCreate: {
              where: {
                id: incomingCarpeta.numero,
              },
              create: newDemanda,
            },
          },
          notas: {
            createMany: {
              data          : notas,
              skipDuplicates: true,
            },
          },
          procesos: {
            connectOrCreate: procesos.map(
              (
                proceso
              ) => {
                const {
                  juzgado, ...restProceso
                } = proceso;

                const procesoCreateorConnect: Prisma.ProcesoCreateOrConnectWithoutCarpetaInput
              = {
                where: {
                  idProceso: proceso.idProceso,
                },
                create: {
                  ...restProceso,
                  juzgado: {
                    connectOrCreate: {
                      where: {
                        id_tipo_ciudad: {
                          tipo  : juzgado.tipo,
                          id    : juzgado.id,
                          ciudad: juzgado.ciudad,
                        },
                      },
                      create: {
                        tipo  : juzgado.tipo,
                        id    : juzgado.id,
                        ciudad: juzgado.ciudad,
                        url   : juzgado.url
                      },
                    },
                  },
                  actuaciones: {
                    connectOrCreate: actuaciones.map(
                      (
                        actuacion
                      ) => {
                        const actuacionCreateOrConnect: Prisma.ActuacionCreateOrConnectWithoutCarpetaInput
                        = {
                          where: {
                            idRegActuacion: actuacion.idRegActuacion,
                          },
                          create: {
                            ...actuacion,
                          },
                        };
                        return actuacionCreateOrConnect;
                      }
                    ),
                  },
                },
              };

                return procesoCreateorConnect;
              }
            ),
          },
        },
      }
    );

  }
}
