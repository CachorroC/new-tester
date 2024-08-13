import { ConsultaActuacion, intActuacion } from '../types/actuaciones';
import { CarpetaRaw,
  Category,
  Codeudor,
  IntCarpeta,
  IntDemanda,
  IntDeudor,
  TipoProceso, } from '../types/carpetas';
import { ConsultaNumeroRadicacion, intProceso } from '../types/procesos';
import { ClassDemanda } from './demanda';
import { ClassDeudor } from './deudor';

export class BaseCarpeta implements IntCarpeta {
  numero: number;
  llaveProceso: string | null;
  demanda: IntDemanda;
  fecha?: Date;
  ultimaActuacion?: intActuacion;
  category: Category;
  tipoProceso: TipoProceso;
  deudor: IntDeudor;
  codeudor?: Codeudor;
  cc: number;
  procesos?: intProceso[];
  idProcesos: number[] | null;
  _nombre: string;
  constructor(
    {
      llaveProceso,
      codeudor,
      category,
      deudor,
      demanda,
      numero,
    }: CarpetaRaw 
  ) {
    this.numero = numero;
    this.idProcesos = null;
    this._nombre = deudor.nombre;
    this.llaveProceso = llaveProceso
      ? llaveProceso
      : null;
    this.demanda = new ClassDemanda(
      demanda 
    );
    this.category = category;
    this.tipoProceso = demanda.tipoProceso
      ? ( demanda.tipoProceso as TipoProceso )
      : 'SINGULAR';
    this.deudor = new ClassDeudor(
      deudor 
    );
    this.codeudor = codeudor;
    this.cc = Number(
      deudor.cedula 
    );
  }

  get nombre() {
    return this._nombre;
  }
  set nombre(
    nom 
  ) {
    this._nombre = nom;
    [
      this.deudor.primerNombre,
      this.deudor.segundoNombre,
      this.deudor.primerApellido,
      this.deudor.segundoApellido,
    ] = nom.split(
      ' ' 
    );
  }
  async getProcesos() {
    try {
      if ( !this.llaveProceso ) {
        throw new Error(
          'aún no se le ha asignado un número de expediente a esta this.llaveProceso',
        );
      }

      const request = await fetch(
        `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${ this.llaveProceso }&SoloActivos=false&pagina=1`,
      );

      if ( !request.ok ) {
        throw new Error(
          'request not ok' 
        );
      }

      const response = ( await request.json() ) as ConsultaNumeroRadicacion;

      if ( !response.procesos || response.procesos.length === 0 ) {
        throw new Error(
          'no hay procesos para esta llaveProceso' 
        );
      }

      this.procesos = response.procesos;
      this.idProcesos = response.procesos.map(
        (
          prc 
        ) => {
          return prc.idProceso;
        } 
      );
    } catch ( error ) {
      console.log(
        error 
      );
    }
  }
  async getAllActuaciones() {
    const actuacionesMap = new Map();

    if ( !this.idProcesos || this.idProcesos.length === 0 ) {
      return;
    }

    for ( const idProceso of this.idProcesos ) {
      try {
        const request = await fetch(
          `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Proceso/Actuaciones/${ idProceso }`,
        );

        if ( !request.ok ) {
          throw new Error(
            'no hay actuaciones en este idProceso' 
          );
        }

        const response = ( await request.json() ) as ConsultaActuacion;

        if ( !response.actuaciones || response.actuaciones.length === 0 ) {
          throw new Error(
            'no hay actuaciones disponibles en el query' 
          );
        }

        [ this.ultimaActuacion ] = response.actuaciones;
        actuacionesMap.set(
          idProceso, response.actuaciones 
        );

        this.fecha = new Date(
          this.ultimaActuacion.fechaActuacion 
        );
      } catch ( error ) {
        console.log(
          error 
        );
      }
    }

    const newAllActs = Object.fromEntries(
      actuacionesMap 
    );
    console.log(
      newAllActs 
    );
  }
}
