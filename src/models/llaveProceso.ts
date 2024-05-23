import { client } from '../services/prisma';
import * as fs from 'fs/promises';

const entitiesMap = new Set();

const entitiesSet = new Set<string>();

const especialidadSet = new Set<string>();

const despachosSet = new Set<string>();

export class ClassKey {
  departamento: string = '11';
  ciudad: string = '001';
  entidad: string = '00';
  especialidad: string = '00';
  despacho: string = '000';
  ano: string = '2017';
  codigoProceso: string = '00000';
  recurso: string = '00';
  constructor(
    llaveProceso: string 
  ) {
    const matchedNumbers = llaveProceso.matchAll(
      /(\d+)/gm 
    );

    for ( const matchedNumber of matchedNumbers ) {
      console.log(
        matchedNumber.at(
          1 
        ) 
      );
    }

    const matcher = llaveProceso.matchAll(
      /(\d{2})(\d{3})(\d{2})(\d{2})(\d{3})(\d{4})(\d{5})(\d+)/gm,
    );

    for ( const matched of matcher ) {
      const [
        total,
        deparamento,
        ciudad,
        entidad,
        especialidad,
        despacho,
        ano,
        codigoProceso,
        recurso,
      ] = matched;
      this.departamento = deparamento;
      this.ciudad = ciudad;
      this.entidad = entidad;

      this.especialidad = especialidad;

      this.despacho = despacho;
      despachosSet.add(
        despacho 
      );
      this.ano = ano;
      this.codigoProceso = codigoProceso;
      this.recurso = recurso;
      console.log(
        total 
      );
      console.log(
        matched 
      );
    }

    entitiesSet.add(
      this.entidad 
    );
    especialidadSet.add(
      this.especialidad 
    );
    despachosSet.add(
      this.despacho 
    );
    entitiesMap.add(
      {
        entidad     : this.entidad,
        especialidad: this.especialidad,
      } 
    );
  }
}

async function getLLaves() {
  const carpetas = await client.carpeta.findMany();
  return carpetas.map(
    (
      carpeta 
    ) => {
      return new ClassKey(
        carpeta.llaveProceso 
      );
    } 
  );
}

getLLaves()
  .then(
    (
      rr 
    ) => {
      const output = {
        classKeys: rr,
        entidades: Array.from(
          entitiesSet 
        ),
        especialidades: Array.from(
          especialidadSet 
        ),
        despachos: Array.from(
          despachosSet 
        ),
        mapSet: Array.from(
          entitiesMap 
        ),
      };
      console.log(
        output 
      );
      fs.writeFile(
        'llavesProcesoParts.json', JSON.stringify(
          output 
        ) 
      );
    } 
  );
