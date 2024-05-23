import { client } from '../services/prisma';
import { ConsultaActuacion, outActuacion } from '../types/actuaciones';
import * as fs from 'fs/promises';

export class ClassActuaciones {
  idProceso: number;
  actuaciones: outActuacion[] = [];
  ultimaActuacion: outActuacion | null;
  fecha: Date | null;
  numero: number;
  constructor(
    idProceso: number, actuaciones: outActuacion[], numero: number 
  ) {
    this.idProceso = idProceso;
    this.actuaciones = actuaciones;
    this.numero = numero;

    const ultimaAct = actuaciones.find(
      (
        act 
      ) => {
        return act.isUltimaAct;
      } 
    );

    if ( ultimaAct ) {
      this.ultimaActuacion = ultimaAct;
      this.fecha = ultimaAct.fechaActuacion;
    } else {
      this.fecha = null;
      this.ultimaActuacion = null;
    }
  }

  async prismaUpdaterActuaciones() {
    try {
      const carpeta = await client.carpeta.findFirstOrThrow(
        {
          where: {
            numero: this.numero,
          },
        } 
      );

      if ( !this.fecha || !this.ultimaActuacion ) {
        return {
          success: false,
          data   : 'no se le asignó fecha o ultima actuacion en el constructor',
        };
      }

      const incomingDate = new Date(
        this.fecha 
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
          'no hay saved date o la saved date es menor qque incoming date',
        );

        const updater = await client.carpeta.update(
          {
            where: {
              numero: carpeta.numero,
            },
            data: {
              fecha: new Date(
                this.fecha 
              ),
              revisado       : false,
              ultimaActuacion: {
                connectOrCreate: {
                  where: {
                    idRegActuacion: this.ultimaActuacion?.idRegActuacion,
                  },
                  create: {
                    ...this.ultimaActuacion,
                  },
                },
              },
            },
          } 
        );
        console.log(
          updater 
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
            this.ultimaActuacion.idRegActuacion
          }.json`,
          JSON.stringify(
            {
              today    : new Date(),
              savedDate: savedDate
                ? new Date(
                  savedDate 
                )
                : 'no hay fecha en la base de datos',
              ultimaActuacion: this.ultimaActuacion,
            } 
          ),
        );
        return {
          success: true,
          data   : JSON.stringify(
            updater, null, 2 
          ),
        };
      }

      return {
        success: false,
        data   : this.numero,
      };
    } catch ( error ) {
      console.log(
        error 
      );
      return {
        success: false,
        data   : JSON.stringify(
          error, null, 2 
        ),
      };
    }
  }
  static async getActuaciones(
    idProceso: number, numero: number 
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

      const actuacionesmapper = actuaciones.map(
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
            isUltimaAct:
            actuacion.cant === actuacion.consActuacion
              ? true
              : false,
            idProceso: idProceso,
          };
        } 
      );
      return new ClassActuaciones(
        idProceso, actuacionesmapper, numero 
      );
    } catch ( error ) {
      console.log(
        error 
      );
      return new ClassActuaciones(
        idProceso, [], numero 
      );
    }
  }
}
