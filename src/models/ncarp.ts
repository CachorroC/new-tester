import { $Enums, Carpeta } from '@prisma/client';
import { CarpetaRaw } from '../types/carpetas';

export class PrisCarp implements Carpeta {
  [x: string]: unknown;
  constructor(
    {
      llaveProceso, category, deudor, numero 
    }: CarpetaRaw,
    demandaId?: number,
  ) {
    this.llaveProceso = llaveProceso
      ? llaveProceso
      : null;
    this.numero = numero;
    this.category = category;
    this.deudorCedula = String(
      deudor.cedula 
    );

    this.demandaId = demandaId
      ? demandaId
      : null;
  }
  numero: number;
  llaveProceso: string | null;
  category: $Enums.Category;

  demandaId: number | null;
  deudorCedula: string | null;
  get idProcesos() {
    return this.idProcesos;
  }
  set idProcesos(
    idps: number[] 
  ) {
    this.idProcesos = idps;
  }
  get nombre() {
    return `${ this.primerNombre } ${ this.segundoNombre } ${ this.primerApellido } ${ this.segundoApellido }`;
  }
  set nombre(
    nom 
  ) {
    [
      this.primerNombre,
      this.segundoNombre,
      this.primerApellido,
      this.segundoApellido,
    ] = nom.split(
      ' ' 
    );
  }

  async getIdProcesos(
    llaveProceso = this.llaveProceso 
  ) {
    try {
      if ( !llaveProceso || llaveProceso === null ) {
        throw new Error(
          'no hay un expediente adjunto a este proceso;' 
        );
      }

      if ( llaveProceso.length < 23 ) {
        throw new Error(
          `este expediente no es del largo apropiado, tiene menos de 23 caracteres: ${ llaveProceso }`,
        );
      }

      const request = await fetch(
        `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Procesos/Consulta/NumeroRadicacion?numero=${ llaveProceso }&SoloActivos=false&pagina=1`,
      );

      if ( !request.ok ) {
        const json = await request.json();
        throw new Error(
          `error al realizar el fetch: json: ${ JSON.stringify(
            json, null, 2 
          ) }`,
        );
      }

      return request.json();
    } catch ( error ) {
      console.log(
        JSON.stringify(
          error, null, 2 
        ) 
      );

      return error;
    }
  }
}
