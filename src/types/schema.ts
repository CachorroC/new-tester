// To parse this data:
//
//   import { Convert, Schema } from "./file";
//
//   const schema = Convert.toSchema(json);

export interface Schema {
  actuacion?: Actuacion;
  carpeta?: Carpeta;
  codeudor?: Codeudor;
  demanda?: Demanda;
  deudor?: Deudor;
  juzgado?: Juzgado;
  medidasCautelares?: MedidasCautelares;
  nota?: Nota;
  notificacion?: Notificacion;
  notifier?: Notifier;
  proceso?: Proceso;
  subTarea?: SubTarea;
  tarea?: Tarea;
}

export interface SubTarea {
  Tarea?: null | Tarea;
  date?: Date | null;
  id?: number;
  isComplete?: boolean;
  text?: string;
}

export interface Tarea {
  Carpeta?: null | Carpeta;
  complete?: boolean;
  content?: null | string;
  createdAt?: Date;
  dueDate?: Date | null;
  id?: number;
  subTareas?: SubTarea[];
  title?: string;
  updatedAt?: Date;
}

export interface Juzgado {
  id?: number;
  procesos?: Proceso[];
  tipo?: string;
  url?: string;
}

export interface Proceso {
  actuaciones?: Actuacion[];
  cantFilas?: number;
  carpeta?: Carpeta;
  departamento?: string;
  despacho?: string;
  esPrivado?: boolean;
  fechaProceso?: Date | null;
  fechaUltimaActuacion?: Date | null;
  idConexion?: number;
  idProceso?: number;
  juzgado?: Juzgado;
  llaveProceso?: string;
  sujetosProcesales?: string;
}

export interface Notifier {
  fechaAporta?: Date | null;
  fechaRecibido?: Date | null;
  id?: number;
  notificacion?: null | Notificacion;
  resultado?: boolean | null;
  tipo?: string;
}

export interface Notificacion {
  autoNotificado?: null | string;
  carpeta?: Carpeta;
  certimail?: boolean | null;
  fisico?: boolean | null;
  id?: number;
  notifiers?: Notifier[];
}

export interface Nota {
  carpeta?: null | Carpeta;
  content?: null | string;
  createdAt?: Date;
  date?: Date;
  id?: number;
  pathname?: null | string;
  title?: string;
  updatedAt?: Date;
}

export interface Deudor {
  carpeta?: Carpeta;
  cedula?: string;
  direccion?: null | string;
  email?: null | string;
  id?: number;
  primerApellido?: string;
  primerNombre?: string;
  segundoApellido?: null | string;
  segundoNombre?: null | string;
  telCelular?: null | string;
  telFijo?: null | string;
}

export interface MedidasCautelares {
  demanda?: Demanda[];
  fechaOrdenaMedida?: Date | null;
  id?: number;
  medidaSolicitada?: null | string;
}

export interface Demanda {
  capitalAdeudado?: number | null;
  carpeta?: Carpeta;
  departamento?: null | string;
  despacho?: null | string;
  entregaGarantiasAbogado?: Date | null;
  etapaProcesal?: null | string;
  expediente?: null | string;
  fechaPresentacion?: string[];
  id?: number;
  mandamientoPago?: Date | null;
  medidasCautelares?: null | MedidasCautelares;
  municipio?: null | string;
  obligacion?: string[];
  radicado?: null | string;
  tipoProceso?: TipoProceso;
  vencimientoPagare?: string[];
}

export interface Codeudor {
  carpeta?: Carpeta;
  cedula?: null | string;
  direccion?: null | string;
  id?: number;
  nombre?: null | string;
  telefono?: null | string;
}

export interface Carpeta {
  category?: Category;
  codeudor?: null | Codeudor;
  demanda?: null | Demanda;
  deudor?: null | Deudor;
  fecha?: Date | null;
  idProcesos?: number[];
  llaveProceso?: string;
  nombre?: string;
  notas?: Nota[];
  notificacion?: null | Notificacion;
  numero?: number;
  procesos?: Proceso[];
  revisado?: boolean;
  tareas?: Tarea[];
  terminado?: boolean;
  ultimaActuacion?: null | Actuacion;
  updatedAt?: Date;
}

export interface Actuacion {
  actuacion?: string;
  anotacion?: null | string;
  cant?: number;
  carpetaNumero?: number | null;
  carpetas?: Carpeta[];
  codRegla?: string;
  conDocumentos?: boolean;
  consActuacion?: number;
  createdAt?: Date;
  fechaActuacion?: Date;
  fechaFinal?: Date | null;
  fechaInicial?: Date | null;
  fechaRegistro?: Date;
  idRegActuacion?: number;
  isUltimaAct?: boolean;
  llaveProceso?: string;
  proceso?: Proceso;
}

export type TipoProceso =
  | 'HIPOTECARIO'
  | 'PRENDARIO'
  | 'SINGULAR'
  | 'ACUMULADO';

export type Category =
  | 'Terminados'
  | 'LiosJuridicos'
  | 'Bancolombia'
  | 'Reintegra'
  | 'Insolvencia'
  | 'SinEspecificar'
  | 'todos';

// Converts JSON strings to/from your types
export class Convert {
  public static toSchema(
    json: string 
  ): Schema {
    return JSON.parse(
      json 
    );
  }

  public static schemaToJson(
    value: Schema 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toSubTarea(
    json: string 
  ): SubTarea {
    return JSON.parse(
      json 
    );
  }

  public static subTareaToJson(
    value: SubTarea 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toTarea(
    json: string 
  ): Tarea {
    return JSON.parse(
      json 
    );
  }

  public static tareaToJson(
    value: Tarea 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toJuzgado(
    json: string 
  ): Juzgado {
    return JSON.parse(
      json 
    );
  }

  public static juzgadoToJson(
    value: Juzgado 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toProceso(
    json: string 
  ): Proceso {
    return JSON.parse(
      json 
    );
  }

  public static procesoToJson(
    value: Proceso 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toNotifier(
    json: string 
  ): Notifier {
    return JSON.parse(
      json 
    );
  }

  public static notifierToJson(
    value: Notifier 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toNotificacion(
    json: string 
  ): Notificacion {
    return JSON.parse(
      json 
    );
  }

  public static notificacionToJson(
    value: Notificacion 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toNota(
    json: string 
  ): Nota {
    return JSON.parse(
      json 
    );
  }

  public static notaToJson(
    value: Nota 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toDeudor(
    json: string 
  ): Deudor {
    return JSON.parse(
      json 
    );
  }

  public static deudorToJson(
    value: Deudor 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toMedidasCautelares(
    json: string 
  ): MedidasCautelares {
    return JSON.parse(
      json 
    );
  }

  public static medidasCautelaresToJson(
    value: MedidasCautelares 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toDemanda(
    json: string 
  ): Demanda {
    return JSON.parse(
      json 
    );
  }

  public static demandaToJson(
    value: Demanda 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toCodeudor(
    json: string 
  ): Codeudor {
    return JSON.parse(
      json 
    );
  }

  public static codeudorToJson(
    value: Codeudor 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toCarpeta(
    json: string 
  ): Carpeta {
    return JSON.parse(
      json 
    );
  }

  public static carpetaToJson(
    value: Carpeta 
  ): string {
    return JSON.stringify(
      value 
    );
  }

  public static toActuacion(
    json: string 
  ): Actuacion {
    return JSON.parse(
      json 
    );
  }

  public static actuacionToJson(
    value: Actuacion 
  ): string {
    return JSON.stringify(
      value 
    );
  }
}
