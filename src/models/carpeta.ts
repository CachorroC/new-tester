import { Prisma } from '@prisma/client';
import { tipoProcesoBuilder } from '../data/tipoProcesos';
import { ConsultaActuacion, outActuacion } from '../types/actuaciones';
import { Category,
  Codeudor,
  IntCarpeta,
  Juzgado,
  TipoProceso, } from '../types/carpetas';
import { ConsultaNumeroRadicacion, outProceso } from '../types/procesos';
import { RawDb } from '../types/raw-db';
import { ClassDemanda } from './demanda';
import { ClassDeudor } from './deudor';
import { NewJuzgado } from './juzgado';
import { NotasBuilder } from './nota';

export class Carpeta implements IntCarpeta {
  //PROPERTIES -todas las propiedades  que existen en la class carpeta

  //PROPERTIES array objects
  procesos: outProceso[] = [];
  idProcesos: number[] = [];
  actuaciones: outActuacion[] = [];
  notas: NotasBuilder[] = [];
  //!PROPERTIES

  //PROPERTIES reg objects
  ultimaActuacion: outActuacion | null;
  codeudor: Codeudor;
  demanda: ClassDemanda;
  deudor: ClassDeudor;
  //!PROPERTIES

  //PROPERTIES primitive types
  numero: number;
  llaveProceso: string;
  fecha: Date | null;
  idRegUltimaAct: number | null;
  id: number;
  category: Category;
  nombre: string;
  revisado: boolean;
  terminado: boolean;
  tipoProceso: TipoProceso;
  notasCount: number | null;
  //!PROPERTIES
  //!PROPERTIES
  //CONSTRUCTOR - EL CONSTRUCTOR DE LA CARPETA
  constructor(
    rawCarpeta: RawDb
  ) {
    const {
      NUMERO,
      category,
      DEMANDADO_IDENTIFICACION: cedula,
      EXPEDIENTE,
      DEMANDADO_NOMBRE,
      CODEUDOR_NOMBRE,
      CODEUDOR_IDENTIFICACION,
      CODEUDOR_DIRECCION,
      CODEUDOR_TELEFONOS,
      JUZGADO_EJECUCION,
      JUZGADO_ORIGEN,
      JUZGADO_CIUDAD,
      TIPO_PROCESO,
      EXTRA,
      OBSERVACIONES,
    } = rawCarpeta;

    let idBuilder;

    let notasCounter = 0;

    if ( OBSERVACIONES ) {
      const extras = OBSERVACIONES.split(
        '//'
      );
      extras.forEach(
        (
          nota
        ) => {
          notasCounter++;

          const newNoter = new NotasBuilder(
            nota, Number(
              NUMERO
            ), notasCounter
          );
          this.notas.push(
            newNoter
          );
        }
      );
    }

    if ( EXTRA ) {
      console.log(
        `EXTRAS === ${ EXTRA }`
      );

      const extras = String(
        EXTRA
      )
        .split(
          '//'
        );

      extras.forEach(
        (
          nota
        ) => {
          notasCounter++;

          const newNoter = new NotasBuilder(
            nota, Number(
              NUMERO
            ), notasCounter
          );
          this.notas.push(
            newNoter
          );
        }
      );
    }

    const cedulaAsNumber = Number(
      cedula
    );

    if ( isNaN(
      cedulaAsNumber
    ) ) {
      idBuilder = Number(
        NUMERO
      );
    } else {
      idBuilder = cedulaAsNumber;
    }

    this.notasCount = notasCounter;
    this.id = idBuilder;
    this.idRegUltimaAct = null;
    this.numero = isNaN(
      Number(
        NUMERO
      )
    )
      ? this.id
      : Number(
        NUMERO 
      );
    this.category = category;
    this.deudor = new ClassDeudor(
      rawCarpeta
    );

    this.llaveProceso = String(
      EXPEDIENTE
    );
    this.demanda = new ClassDemanda(
      rawCarpeta
    );
    this.nombre = String(
      DEMANDADO_NOMBRE
    );
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
    this.idRegUltimaAct = null;
    this.fecha = null;
    this.ultimaActuacion = null;
    this.llaveProceso = EXPEDIENTE
      ? String(
        EXPEDIENTE
      )
      : 'SinEspecificar';
    this.numero = Number(
      NUMERO
    );
    this.ciudad = String(
      JUZGADO_CIUDAD
    );
    this.juzgado = NewJuzgado.fromShortName(
      {
        ciudad: String(
          JUZGADO_CIUDAD
        ),
        juzgadoRaw: JUZGADO_EJECUCION
          ? JUZGADO_EJECUCION
          : JUZGADO_ORIGEN
            ? JUZGADO_ORIGEN
            : '',

      }
    );
    this.fechaUltimaRevision = null;
    this.juzgadoTipo = this.juzgado.tipo;
  }
  juzgadoTipo: string | null;
  ciudad: string | null;
  juzgado: Juzgado;
  fechaUltimaRevision: Date | null;
  //!CONSTRUCTOR -
  //METHODS
  //ASYNC - getProcesos
  async getProcesos() {
    try {
      const request = await fetch(
        `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${ this.llaveProceso }&SoloActivos=false&pagina=1`,
      );

      if ( !request.ok ) {
        const json = await request.json();

        throw new Error(
          JSON.stringify(
            json
          )
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

      return this.procesos;
    } catch ( error ) {
      console.log(
        `${ this.numero } => error en CarpetaBuilder.getProcesos(${ this.llaveProceso }) => ${ error }`,
      );
      return [];
    }
  }
  //!ASYNC
  //ASYNC - getActuaciones
  async getActuaciones() {
    if ( this.idProcesos.length === 0 ) {
      return [];
    }

    for ( const idProceso of this.idProcesos ) {
      try {
        const request = await fetch(
          `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Proceso/Actuaciones/${ idProceso }`,
        );

        if ( !request.ok ) {
          throw new Error(
            request.statusText
          );
        }

        const consultaActuaciones = ( await request.json() ) as ConsultaActuacion;

        const {
          actuaciones
        } = consultaActuaciones;

        const outActuaciones = actuaciones.map(
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

        outActuaciones.forEach(
          (
            actuacion
          ) => {
            this.actuaciones.push(
              actuacion
            );
          }
        );
        continue;
      } catch ( error ) {
        console.log(
          `${
            this.numero
          } ERROR ==> getActuaciones ${ idProceso } => ${ JSON.stringify(
            error,
            null,
            2,
          ) }`,
        );
        continue;
      }
    }

    if ( this.actuaciones.length > 0 ) {
      const sorted = [ ...this.actuaciones ].sort(
        (
          a, b
        ) => {
          const fechaA = a.fechaActuacion;

          const fechaB = b.fechaActuacion;

          if ( fechaA < fechaB ) {
            return -1;
          } else if ( fechaA > fechaB ) {
            return 1;
          }

          return 0;
        }
      );

      const [ ultimaActuacion ] = sorted;
      this.ultimaActuacion = ultimaActuacion;
      this.fecha = ultimaActuacion.fechaActuacion;
      this.idRegUltimaAct = ultimaActuacion.idRegActuacion;
    }

    return this.actuaciones;
  }
  //!ASYNC
  //STATIC

  static prismaCarpeta(
    carpeta: IntCarpeta
  ) {
    const newCarpeta: Prisma.CarpetaCreateInput = {
      id          : carpeta.id,
      llaveProceso: carpeta.llaveProceso,
      nombre      : carpeta.nombre,
      ciudad      : carpeta.ciudad,
      numero      : carpeta.numero,
      category    : carpeta.category,
      fecha       : carpeta.fecha,
      idProcesos  : carpeta.idProcesos,
      notasCount  : carpeta.notasCount,
      revisado    : carpeta.revisado,
      terminado   : carpeta.terminado,
      tipoProceso : carpeta.tipoProceso,
    };
    return newCarpeta;
  }
  //!STATIC
  //!METHODS
}
