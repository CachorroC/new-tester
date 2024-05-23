import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';

export const prisma = new PrismaClient();

async function getSujetosProcesales() {
  const carpetas = await prisma.carpeta.findMany(
    {
      include: {
        procesos: {
          include: {
            juzgado: true,
          },
        },
        ultimaActuacion: true,
        deudor         : true,
        demanda        : true,
      },
    } 
  );
  return carpetas.flatMap(
    (
      carpeta 
    ) => {
      return carpeta.procesos.map(
        (
          proceso 
        ) => {
          return {
            sujetos: proceso.sujetosProcesales,
            juzgado: proceso.juzgado,
          };
        } 
      );
    } 
  );
}

async function sujetosObjectBuilder() {
  const objectMapArray = [];

  const arrayCarpetas = await getSujetosProcesales();

  const allSujetosProcesales = arrayCarpetas.map(
    (
      carpeta 
    ) => {
      return carpeta.sujetos;
    } 
  );
  fs.writeFile(
    'sujetosRaw.json', JSON.stringify(
      allSujetosProcesales 
    ) 
  );
  /*
  const correctSujetos = allSujetosProcesales.map(
    (
      sujetosProcesales
    ) => {
      const matcher = sujetosProcesales.matchAll(
        /(\s?)([A-Za-z\s/]+)(:)(\s?)([A-Za-z\s.ÓóÚúÍíÁáÉéÑñ\(\)]+)(\|?)/gm
      );

    }
  ); */

  for ( const sujetosProcesales of allSujetosProcesales ) {
    const mapperObject = new Map();

    const matcher = sujetosProcesales.matchAll(
      /(\s?)([A-Za-z\s/]+)(:)(\s?)([A-Za-z\s.ÓóÚúÍíÁáÉéÑñ()]+)(\|?)/gm,
    );

    for ( const matchedValue of matcher ) {
      console.log(
        matchedValue[ 2 ].trim() 
      );
      console.log(
        matchedValue[ 5 ] 
      );
      mapperObject.set(
        matchedValue[ 2 ], matchedValue[ 5 ].trim() 
      );
    }

    /*
    for ( const demandadoODemandante of newSujetos ) {
      const splitter = demandadoODemandante.split(
        ':'
      );
      console.log(
        splitter
      );

      const fixer = splitter.map(
        (
          value
        ) => {
          return value.trim();
        }
      );
      mapperObject.set(
        fixer[ 0 ], fixer[ 1 ]
      );
    }
 */
    const objectMapper = Object.fromEntries(
      mapperObject 
    );
    objectMapArray.push(
      objectMapper 
    );
  }

  fs.writeFile(
    'sujetosProcesales.json', JSON.stringify(
      objectMapArray 
    ) 
  );
  return objectMapArray;
}

console.log(
  sujetosObjectBuilder() 
);

async function tiposBuilder() {
  const arrayCarpetas = await getSujetosProcesales();

  const tipejos = arrayCarpetas.map(
    (
      carp 
    ) => {
      return carp.juzgado.tipo;
    } 
  );

  for ( const tipo of tipejos ) {
    const searcher = tipo.search(
      /([Ee][Jj][Ee][Cc])/gm 
    );
    console.log(
      searcher 
    );
  }

  fs.writeFile(
    'juzgadosTipo.json', JSON.stringify(
      tipejos 
    ) 
  );
}

console.log(
  tiposBuilder() 
);
