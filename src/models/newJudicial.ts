import * as fs from 'fs/promises';
import { tipoProcesoBuilder } from '../data/tipoProcesos';
import { outActuacion, ConsultaActuacion } from '../types/actuaciones';
import { Codeudor, Category, IntCarpeta, TipoProceso } from '../types/carpetas';
import { outProceso, ConsultaNumeroRadicacion } from '../types/procesos';
import { ClassDemanda } from './demanda';
import { ClassDeudor } from './deudor';
import { Carpetas } from '../data/carpetas';
import { NotasBuilder } from './nota';
import { RawDb } from '../types/raw-db';
import { NewJuzgado } from './juzgado';
import { client } from '../services/prisma';

export class NewJudicial implements IntCarpeta {
  id: number;
  actuaciones: outActuacion[] = [];
  category: Category;
  codeudor: Codeudor;
  demanda: ClassDemanda;
  deudor: ClassDeudor;
  fecha: Date | null;
  idProcesos: number[] = [];
  idRegUltimaAct: number | null;
  llaveProceso: string;
  nombre: string;
  numero: number;
  procesos: outProceso[] = [];
  revisado: boolean;
  terminado: boolean;
  tipoProceso: TipoProceso;
  ultimaActuacion: outActuacion | null;
  notas: NotasBuilder[] = [];
  updatedAt: Date;
  constructor(
    rawCarpeta: RawDb, category: Category = 'Bancolombia' 
  ) {
    const {
      NUMERO: numero,
      DEMANDADO_IDENTIFICACION: cedula,
      EXPEDIENTE: llaveProceso,
      DEMANDADO_NOMBRE,
      CODEUDOR_NOMBRE,
      CODEUDOR_IDENTIFICACION,
      CODEUDOR_DIRECCION,
      CODEUDOR_TELEFONOS,
      TIPO_PROCESO,
      EXTRA,
      OBSERVACIONES,
    } = rawCarpeta;

    let idBuilder;

    if ( OBSERVACIONES ) {
      const extras = OBSERVACIONES.split(
        '//' 
      );

      for ( const extra of extras ) {
        const newNoter = new NotasBuilder(
          extra 
        );
        this.notas.push(
          newNoter 
        );
      }
    }

    if ( EXTRA ) {
      const extras = EXTRA.split(
        '//' 
      );

      for ( const extra of extras ) {
        const newNoter = new NotasBuilder(
          extra 
        );
        this.notas.push(
          newNoter 
        );
      }
    }

    const cedulaAsNumber = Number(
      cedula 
    );

    if ( isNaN(
      cedulaAsNumber 
    ) ) {
      idBuilder = Number(
        numero 
      );
    } else {
      idBuilder = cedulaAsNumber;
    }

    this.id = idBuilder;
    this.idRegUltimaAct = null;
    this.numero = Number(
      numero 
    );
    this.category = category;
    this.deudor = new ClassDeudor(
      rawCarpeta 
    );

    this.llaveProceso = String(
      llaveProceso 
    );
    this.demanda = new ClassDemanda(
      rawCarpeta 
    );
    this.nombre = String(
      DEMANDADO_NOMBRE 
    )
      .toLocaleLowerCase();
    this.revisado = false;
    this.codeudor = {
      nombre: CODEUDOR_NOMBRE
        ? String(
          CODEUDOR_NOMBRE 
        )
        : null,
      cedula: CODEUDOR_IDENTIFICACION
        ? String(
          CODEUDOR_IDENTIFICACION 
        )
        : null,
      direccion: CODEUDOR_DIRECCION
        ? String(
          CODEUDOR_DIRECCION 
        )
        : null,
      telefono: CODEUDOR_TELEFONOS
        ? String(
          CODEUDOR_TELEFONOS 
        )
        : null,
      id: this.numero,
    };
    this.tipoProceso = TIPO_PROCESO
      ? tipoProcesoBuilder(
        TIPO_PROCESO 
      )
      : 'SINGULAR';

    this.terminado = category === 'Terminados'
      ? true
      : false;
    this.ultimaActuacion = null;
    this.fecha = null;
    this.updatedAt = new Date();
  }

  async getProcesos() {
    try {
      if ( this.llaveProceso === 'SinEspecificar' ) {
        throw new Error(
          'no hay llaveProceso en esta carpeta, aborting' 
        );
      }

      const request = await fetch(
        `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${ this.llaveProceso }&SoloActivos=false&pagina=1`,
      );

      if ( !request.ok ) {
        const json = await request.json();

        const message = `Error
        Judicial.getProcesos.fetchError(${ this.numero }) =>
  ${ JSON.stringify(
    json, null, 2 
  ) }
  ${ json }
  ${ request.status }
  ${ request.statusText }
  `;
        throw new Error(
          message 
        );
      }

      const consultaProcesos
        = ( await request.json() ) as ConsultaNumeroRadicacion;

      const {
        procesos 
      } = consultaProcesos;

      for ( const rawProceso of procesos ) {
        if ( rawProceso.esPrivado ) {
          continue;
        }

        const proceso = {
          ...rawProceso,
          fechaProceso: rawProceso.fechaProceso
            ? new Date(
              rawProceso.fechaProceso 
            )
            : null,
          fechaUltimaActuacion: rawProceso.fechaUltimaActuacion
            ? new Date(
              rawProceso.fechaUltimaActuacion 
            )
            : null,
          juzgado: NewJuzgado.fromProceso(
            rawProceso 
          ),
        };
        this.procesos.push(
          proceso 
        );
        this.idProcesos.push(
          proceso.idProceso 
        );
      }
    } catch ( error ) {
      console.log(
        `${ this.numero } => error en CarpetaBuilder.getProcesos(${ this.numero }) => ${ error }`,
      );
    }

    return this.procesos;
  }

  async updateProcesosinPrisma() {
    try {
      const prismaInserter = await client.proceso.createMany(
        {
          data: this.procesos.map(
            (
              proceso 
            ) => {
              const {
                juzgado, ...fixedProceso 
              } = proceso;
              return {
                ...fixedProceso,
                juzgadoTipo  : juzgado.tipo,
                carpetaNumero: this.numero,
              };
            } 
          ),
          skipDuplicates: true,
        } 
      );
      console.log(
        prismaInserter 
      );
    } catch ( error ) {
      console.log(
        `${
          this.numero
        } error al intentar insertar los procesos en prisma: ${ JSON.stringify(
          error,
          null,
          2,
        ) }`,
      );
    }

    for ( const proceso of this.procesos ) {
      try {
        const prismaUpdateProceso = await client.proceso.upsert(
          {
            where: {
              idProceso: proceso.idProceso,
            },
            create: {
              ...proceso,
              juzgado: {
                connectOrCreate: {
                  where: {
                    tipo: proceso.juzgado.tipo,
                  },
                  create: proceso.juzgado,
                },
              },
              carpeta: {
                connect: {
                  numero: this.numero,
                },
              },
            },
            update: {
              ...proceso,
              juzgado: {
                connectOrCreate: {
                  where: {
                    tipo: proceso.juzgado.tipo,
                  },
                  create: proceso.juzgado,
                },
              },
              carpeta: {
                connect: {
                  numero: this.numero,
                },
              },
            },
          } 
        );
        console.log(
          `${ this.numero } ${
            proceso.idProceso
          }prisma proceso updated => ${ JSON.stringify(
            prismaUpdateProceso,
            null,
            2,
          ) }`,
        );
      } catch ( e ) {
        console.log(
          `${ this.numero } ${
            proceso.idProceso
          } error al insertar el proceso en prisma: ${ JSON.stringify(
            e,
            null,
            2,
          ) }`,
        );
      }
    }
  }
  async getActuaciones() {
    if ( !this.idProcesos || this.idProcesos.length === 0 ) {
      return;
    }

    for ( const idProceso of this.idProcesos ) {
      try {
        const request = await fetch(
          `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Proceso/Actuaciones/${ idProceso }`,
        );

        if ( !request.ok ) {
          const json = await request.json();
          throw new Error(
            JSON.stringify(
              json 
            ) 
          );
        }

        const consultaActuaciones = ( await request.json() ) as ConsultaActuacion;

        const {
          actuaciones 
        } = consultaActuaciones;

        const [ ultimaActuacion ] = actuaciones;

        const incomingDate = new Date(
          ultimaActuacion.fechaActuacion 
        );

        const incomingYear = incomingDate.getFullYear();

        const incomingMonth = incomingDate.getMonth();

        const incomingDay = incomingDate.getDate();
        console.log(
          `${ this.numero } => la nueva fecha de la actuacion es: ${ new Date(
            incomingYear,
            incomingMonth,
            incomingDay,
          ) } y el timezone offset es  ${ incomingDate.getTimezoneOffset() }
          raw: ${ ultimaActuacion.fechaActuacion }`,
        );

        const {
          fecha 
        } = await client.carpeta.findFirstOrThrow(
          {
            where: {
              numero: this.numero,
            },
          } 
        );
        console.log(
          `la fecha guardada en prisma es: ${ fecha }` 
        );
        console.log(
          `${
            fecha && fecha < incomingDate
              ? 'la fecha en prisma  es menor que incoming date'
              : 'la fecha en prisma es mayor que incoming dt¡ate '
          }`,
        );

        if (
          !this.fecha
          || !fecha
          || fecha < incomingDate
          || fecha.toString() === 'Invalid Date'
        ) {
          this.fecha = new Date(
            ultimaActuacion.fechaActuacion 
          );
          this.ultimaActuacion = {
            ...ultimaActuacion,
            idProceso     : idProceso,
            fechaActuacion: new Date(
              ultimaActuacion.fechaActuacion 
            ),
            fechaRegistro: new Date(
              ultimaActuacion.fechaRegistro 
            ),
            fechaFinal: ultimaActuacion.fechaFinal
              ? new Date(
                ultimaActuacion.fechaFinal 
              )
              : null,
            fechaInicial: ultimaActuacion.fechaInicial
              ? new Date(
                ultimaActuacion.fechaInicial 
              )
              : null,
            isUltimaAct:
              ultimaActuacion.cant === ultimaActuacion.consActuacion
                ? true
                : false,
          };
          this.idRegUltimaAct = ultimaActuacion.idRegActuacion;
        }

        this.actuaciones = actuaciones.map(
          (
            actuacion 
          ) => {
            return {
              ...actuacion,
              idProceso: idProceso,
              isUltimaAct:
              actuacion.cant === actuacion.consActuacion
                ? true
                : false,
              createdAt     : new Date(),
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
            };
          } 
        );
      } catch ( error ) {
        console.log(
          error, null, 2 
        );
        continue;
      }
    }
  }

  async updateActuacionesInPrisma() {
    try {
      const inserter = await client.actuacion.createMany(
        {
          data: this.actuaciones.map(
            (
              actuacion 
            ) => {
              return {
                ...actuacion,
                carpetaNumero: this.numero,
              };
            } 
          ),
          skipDuplicates: true,
        } 
      );
      return inserter;
    } catch ( error ) {
      console.log(
        `${
          this.numero
        }  error al insertar las actuaciones en prisma: ${ JSON.stringify(
          error,
          null,
          2,
        ) }`,
      );
      return null;
    }
  }
  async prismaUpdater() {
    try {
      const upserter = await client.carpeta.upsert(
        {
          where: {
            numero: this.numero,
          },
          create: {
            id          : this.id,
            revisado    : false,
            tipoProceso : this.tipoProceso as TipoProceso,
            llaveProceso: this.llaveProceso,
            idProcesos  : this.idProcesos,
            nombre      : this.nombre.toLocaleLowerCase(),
            numero      : this.numero,
            category    : this.category,
            fecha       : this.fecha,
            terminado   : this.category === 'Terminados'
              ? true
              : false,
            ultimaActuacion: this.ultimaActuacion
              ? {
                  connectOrCreate: {
                    where: {
                      idRegActuacion: this.ultimaActuacion.idRegActuacion,
                    },
                    create: {
                      ...this.ultimaActuacion,
                    },
                  },
                }
              : undefined,
            notas: {
              createMany: {
                data: this.notas.map(
                  (
                    nota, index 
                  ) => {
                    console.log(
                      index 
                    );
                    return {
                      text     : nota.text,
                      dueDate  : nota.dueDate,
                      createdAt: nota.createdAt,
                      pathname : nota.pathname,
                      content  : nota.content,
                    };
                  } 
                ),
                skipDuplicates: true,
              },
            },
            demanda: {
              connectOrCreate: {
                where: {
                  id: this.numero,
                },
                create: {
                  ...this.demanda,
                  id               : this.numero,
                  medidasCautelares: {
                    connectOrCreate: {
                      where: {
                        demandaId: this.numero,
                      },
                      create: {
                        ...this.demanda.medidasCautelares,
                        id: this.numero,
                      },
                    },
                  },
                  notificacion: {
                    connectOrCreate: {
                      where: {
                        demandaId: this.numero,
                      },
                      create: {
                        autoNotificado: this.demanda.notificacion?.autoNotificado,
                        certimail     : this.demanda.notificacion?.certimail
                          ? this.demanda.notificacion.certimail
                          : false,
                        fisico: this.demanda.notificacion?.fisico
                          ? this.demanda.notificacion.fisico
                          : false,
                        id       : this.numero,
                        notifiers: this.demanda.notificacion?.notifiers
                          ? {
                              createMany: {
                                data: this.demanda.notificacion?.notifiers.map(
                                  (
                                    notifier 
                                  ) => {
                                    return {
                                      tipo: notifier.tipo,
                                      fechaAporta:
                                      notifier.fechaAporta?.toString()
                                      === 'Invalid Date'
                                        ? null
                                        : notifier.fechaAporta,
                                      fechaRecibido:
                                      notifier.fechaRecibido?.toString()
                                      === 'Invalid Date'
                                        ? null
                                        : notifier.fechaRecibido,
                                      resultado: notifier.resultado,
                                    };
                                  },
                                ),
                                skipDuplicates: true,
                              },
                            }
                          : undefined,
                      },
                    },
                  },
                },
              },
            },
            deudor: {
              connectOrCreate: {
                where: {
                  id: this.numero,
                },
                create: {
                  primerNombre   : this.deudor.primerNombre,
                  primerApellido : this.deudor.primerApellido,
                  segundoNombre  : this.deudor.segundoNombre,
                  segundoApellido: this.deudor.segundoApellido,
                  email          : this.deudor.email,
                  direccion      : this.deudor.direccion,
                  id             : this.numero,
                  cedula         : String(
                    this.deudor.cedula 
                  ),
                  telCelular: this.deudor.telCelular
                    ? String(
                      this.deudor.telCelular 
                    )
                    : null,
                  telFijo: this.deudor.telFijo
                    ? String(
                      this.deudor.telFijo 
                    )
                    : null,
                },
              },
            },
            codeudor: {
              connectOrCreate: {
                where: {
                  id: this.numero,
                },
                create: {
                  ...this.codeudor,
                  id: this.numero,
                },
              },
            },
            procesos: {
              connectOrCreate: this.procesos?.map(
                (
                  proceso 
                ) => {
                  return {
                    where: {
                      idProceso: proceso.idProceso,
                    },
                    create: {
                      ...proceso,
                      juzgado: {
                        connectOrCreate: {
                          where: {
                            tipo: proceso.juzgado.tipo,
                          },
                          create: proceso.juzgado,
                        },
                      },
                      actuaciones: {
                        createMany: {
                          data: this.actuaciones.map(
                            (
                              actuacion 
                            ) => {
                              return {
                                ...actuacion,
                                isUltimaAct:
                            actuacion.cant === actuacion.consActuacion
                              ? true
                              : false,
                                createdAt     : new Date(),
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
                              };
                            } 
                          ),
                          skipDuplicates: true,
                        },
                      },
                    },
                  };
                } 
              ),
            },
          },
          update: {
            id          : this.id,
            llaveProceso: this.llaveProceso,
            idProcesos  : this.idProcesos,
            nombre      : this.nombre.toLocaleLowerCase(),
            numero      : this.numero,
            category    : this.category,
            fecha       : this.fecha,
            terminado   : this.category === 'Terminados'
              ? true
              : false,
            ultimaActuacion: this.ultimaActuacion
              ? {
                  connectOrCreate: {
                    where: {
                      idRegActuacion: this.ultimaActuacion.idRegActuacion,
                    },
                    create: {
                      ...this.ultimaActuacion,
                    },
                  },
                }
              : undefined,
            notas: {
              createMany: {
                data: this.notas.map(
                  (
                    nota, index 
                  ) => {
                    console.log(
                      index 
                    );
                    return {
                      text     : nota.text,
                      createdAt: nota.createdAt,
                      dueDate  : nota.dueDate,
                      pathname : nota.pathname,
                      content  : nota.content,
                    };
                  } 
                ),
                skipDuplicates: true,
              },
            },
            demanda: {
              connectOrCreate: {
                where: {
                  id: this.numero,
                },
                create: {
                  ...this.demanda,
                  id               : this.numero,
                  medidasCautelares: {
                    connectOrCreate: {
                      where: {
                        demandaId: this.numero,
                      },
                      create: {
                        ...this.demanda.medidasCautelares,
                        id: this.numero,
                      },
                    },
                  },
                  notificacion: {
                    connectOrCreate: {
                      where: {
                        demandaId: this.numero,
                      },
                      create: {
                        autoNotificado: this.demanda.notificacion?.autoNotificado,
                        certimail     : this.demanda.notificacion?.certimail
                          ? this.demanda.notificacion.certimail
                          : false,
                        fisico: this.demanda.notificacion?.fisico
                          ? this.demanda.notificacion.fisico
                          : false,
                        id: this.numero,
                      },
                    },
                  },
                },
              },
            },
            deudor: {
              connectOrCreate: {
                where: {
                  id: this.numero,
                },
                create: {
                  primerNombre   : this.deudor.primerNombre,
                  primerApellido : this.deudor.primerApellido,
                  segundoNombre  : this.deudor.segundoNombre,
                  segundoApellido: this.deudor.segundoApellido,
                  email          : this.deudor.email,
                  direccion      : this.deudor.direccion,
                  id             : this.numero,
                  cedula         : String(
                    this.deudor.cedula 
                  ),
                  telCelular: this.deudor.telCelular
                    ? String(
                      this.deudor.telCelular 
                    )
                    : null,
                  telFijo: this.deudor.telFijo
                    ? String(
                      this.deudor.telFijo 
                    )
                    : null,
                },
              },
            },
            codeudor: {
              connectOrCreate: {
                where: {
                  id: this.numero,
                },
                create: {
                  ...this.codeudor,
                  id: this.numero,
                },
              },
            },
            procesos: {
              connectOrCreate: this.procesos?.map(
                (
                  proceso 
                ) => {
                  return {
                    where: {
                      idProceso: proceso.idProceso,
                    },
                    create: {
                      ...proceso,
                      juzgado: {
                        connectOrCreate: {
                          where: {
                            tipo: proceso.juzgado.tipo,
                          },
                          create: proceso.juzgado,
                        },
                      },
                    },
                  };
                } 
              ),
            },
          },
        } 
      );
      return upserter;
    } catch ( error ) {
      console.log(
        `${ this.numero } prismaUpdaterError => ${ JSON.stringify(
          error,
          null,
          2,
        ) }`,
      );
      return null;
    }
  }
}

/*
async function* getProcesosIteratorIdk () {
  for ( const carpeta of Carpetas ) {

    const newCarpeta = new NewJudicial(
      carpeta
    );
    console.log(
      `${ carpeta.NUMERO } inicia getProcesos`
    );
    await newCarpeta.getProcesos();
    console.log(
      `${ carpeta.NUMERO } finaliza getProcesos`
    );

    console.log(
      `${ carpeta.NUMERO } inicia getActuaciones`
    );
    await newCarpeta.getActuaciones();
    console.log(
      `${ carpeta.NUMERO } finaliza getActuaciones`
    );

    console.log(
      `${ carpeta.NUMERO } inicia prismaUpdater`
    );
    await newCarpeta.prismaUpdater();
    console.log(
      `${ carpeta.NUMERO } finaliza prismaUpdater`
    );
    yield newCarpeta;
  }
}
 */
async function getProcesosIdk() {
  const newCarpetas = new Map();

  for ( const carpeta of Carpetas ) {
    console.log(
      `inicia la carpeta numero ${ carpeta.NUMERO }` 
    );

    const newCarpeta = new NewJudicial(
      carpeta, carpeta.category 
    );
    console.log(
      `${ carpeta.NUMERO } inicia getProcesos` 
    );
    await newCarpeta.getProcesos();
    console.log(
      `${ carpeta.NUMERO } finaliza getProcesos` 
    );

    console.log(
      `${ carpeta.NUMERO } inicia getActuaciones` 
    );
    await newCarpeta.getActuaciones();
    console.log(
      `${ carpeta.NUMERO } finaliza getActuaciones` 
    );

    console.log(
      `${ carpeta.NUMERO } inicia prismaUpdater` 
    );
    await newCarpeta.prismaUpdater();
    console.log(
      `${ carpeta.NUMERO } finaliza prismaUpdater` 
    );
    console.log(
      `${ carpeta.NUMERO } inicia updateProcesosInPrisma` 
    );
    await newCarpeta.updateProcesosinPrisma();
    console.log(
      `${ carpeta.NUMERO } finaliza updateProcesosInPrisma` 
    );
    console.log(
      `${ carpeta.NUMERO } inicia updateActuacionesInPrisma` 
    );
    await newCarpeta.updateActuacionesInPrisma();
    console.log(
      `${ carpeta.NUMERO } finaliza updateActuacionesInPrisma` 
    );

    newCarpetas.set(
      newCarpeta.numero, newCarpeta 
    );
    fs.mkdir(
      `carpetas/${ newCarpeta.numero }`, {
        recursive: true,
      } 
    );
    fs.writeFile(
      `carpetas/${ newCarpeta.numero }/Carpeta.json`,
      JSON.stringify(
        newCarpeta, null, 2 
      ),
    );
  }

  console.log(
    JSON.stringify(
      newCarpetas, null, 2 
    ) 
  );
  /*
  try {
    const collection = await connectToDatabase();

    const upsertOne = await collection.insertMany(
      newCarpetas, {
        ordered        : true
        , ignoreUndefined: true
      }
    );
    console.log(
      `upsert one to mongo: ${ JSON.stringify(
        upsertOne, null, 2
      ) } `
    );

  } catch ( error ) {
    console.log(
      error
    );
  }
 */
  fs.writeFile(
    'Carpetas.json',
    JSON.stringify(
      Array.from(
        newCarpetas.values() 
      ), null, 2 
    ),
  );
}

getProcesosIdk()
  .then(
    (
      rr 
    ) => {
      console.log(
        rr 
      );
      return rr;
    } 
  );
