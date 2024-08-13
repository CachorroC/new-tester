import * as fs from 'fs/promises';
import { Carpetas } from './src/data/carpetas';
import { CarpetaJudicial, sleep } from './src/models/thenable';
import { categoryAssignment } from './src/models/categories';
import { connectToDatabase } from './src/services/database.service';
import { insertActuacionesInPrisma,
  insertJuzgadoInPrisma,
  insertProcesosInPrisma, } from './src/data/insert-carpetas';
import { PrismaCarpeta } from './src/models/prisma-carpeta';

const date = new Date();
console.log(
  date.setSeconds(
    date.getSeconds() + 70 
  ) 
);

async function f() {
  const newCarpetasMap = new Map<number, CarpetaJudicial>();

  const sortedCarpetas = [ ...Carpetas ].sort(
    (
      a, b 
    ) => {
      const x = a.numero;

      const y = b.numero;

      if ( x < y ) {
        return -1;
      } else if ( x > y ) {
        return 1;
      }

      return 0;
    } 
  );

  for ( const rawCarpeta of sortedCarpetas ) {
    const carpeta = categoryAssignment(
      rawCarpeta 
    );

    /*  if ( carpeta.category === 'Terminados' ) {
      continue;
    } */

    const thener = new CarpetaJudicial(
      carpeta 
    );
    console.log(
      thener.cc 
    );

    const prismaCarpeta = new PrismaCarpeta(
      thener 
    );
    await fs.mkdir(
      `carpetas/${ thener.numero }/`, {
        recursive: true,
      } 
    );
    await thener.prismaCarpeta();

    await fs.writeFile(
      `carpetas/${ thener.numero }/prismaCarpetaFirstIteration.json`,
      JSON.stringify(
        prismaCarpeta, null, 2 
      ),
    );

    await fs.writeFile(
      `carpetas/${ thener.numero }/firstIterationOfThenable.json`,
      JSON.stringify(
        thener, null, 2 
      ),
    );

    await sleep(
      50 
    );

    await thener.consultaProcesos();

    fs.writeFile(
      `carpetas/${ thener.numero }/withProcesos.json`,
      JSON.stringify(
        thener, null, 2 
      ),
    );

    if ( !thener.procesos || thener.procesos.length === 0 ) {
      newCarpetasMap.set(
        carpeta.numero, thener 
      );

      continue;
    }

    await thener.prismaProcesos();
    await thener.consultaActuaciones();

    fs.writeFile(
      `carpetas/${ thener.numero }/withActs.json`,
      JSON.stringify(
        thener, null, 2 
      ),
    );

    newCarpetasMap.set(
      carpeta.numero, thener 
    );

    continue;
  }

  const resultArray = Array.from(
    newCarpetasMap.values() 
  );

  await fs.writeFile(
    'src/provisionalCarpetas.json',
    JSON.stringify(
      resultArray, null, 2 
    ),
  );

  return resultArray;
}

async function insertManyCarpetas() {
  const carpetas = await f();

  const collection = await connectToDatabase();

  for ( const carpeta of carpetas ) {
    const {
      numero 
    } = carpeta;

    const insertOne = await collection.updateOne(
      {
        numero: numero,
      },
      {
        $set: carpeta,
      },
      {
        upsert: true,
      },
    );
    console.log(
      `${ numero } => mongoInsert: ${ JSON.stringify(
        insertOne, null, 2 
      ) }`,
    );
    /*
    const prismaCarpetaInserter = await insertCarpetaInPrisma(
      carpeta
    );
    console.log(
      `${ numero }: carpetaInserter: ${ JSON.stringify(
        prismaCarpetaInserter,
        null,
        2,
      ) }`,
    );
    fs.writeFile(
      `carpetas/${ numero }/prismaCarpetaInserterOutput.json`,
      JSON.stringify(
        prismaCarpetaInserter
      ),
    );

    const prismaDemandaInserter = await insertDemandaInPrisma(
      carpeta
    );
    console.log(
      `${ numero }: demandaInserter: ${ JSON.stringify(
        prismaDemandaInserter,
        null,
        2,
      ) }`,
    );
    fs.writeFile(
      `carpetas/${ numero }/prismaDemandaInserterOutput.json`,
      JSON.stringify(
        prismaDemandaInserter
      ),
    ); */

    const prismaJuzgadoInserter = await insertJuzgadoInPrisma(
      carpeta 
    );
    console.log(
      `${ numero }: JuzgadoInserter: ${ JSON.stringify(
        prismaJuzgadoInserter,
        null,
        2,
      ) }`,
    );
    fs.writeFile(
      `carpetas/${ numero }/prismaJuzgadoInserterOutput.json`,
      JSON.stringify(
        prismaJuzgadoInserter 
      ),
    );
    /*
    const prismaDeudorInserter = await insertDeudorInPrisma(
      carpeta
    );
    console.log(
      `${ numero }: deudorInserter: ${ JSON.stringify(
        prismaDeudorInserter, (
          key, value
        ) => {
          return typeof value === 'bigint'
            ? value.toString() + 'n'
            : value;
        }
        , 2
      ) }`,
    );
    fs.writeFile(
      `carpetas/${ numero }/prismaDeudorInserterOutput.json`,
      JSON.stringify(
        prismaDeudorInserter, (
          key, value
        ) => {
          return typeof value === 'bigint'
            ? value.toString() + 'n'
            : value;
        }
      ),
    ); */

    const prismaProcesoInserter = await insertProcesosInPrisma(
      carpeta.procesos ?? [],
      numero,
    );
    console.log(
      `${ numero }: procesoInserter: ${ JSON.stringify(
        prismaProcesoInserter,
        (
          key, value 
        ) => {
          return typeof value === 'bigint'
            ? value.toString() + 'n'
            : value;
        },
        2,
      ) }`,
    );
    fs.writeFile(
      `carpetas/${ numero }/prismaProcesoInserterOutput.json`,
      JSON.stringify(
        prismaProcesoInserter, (
          key, value 
        ) => {
          return typeof value === 'bigint'
            ? value.toString() + 'n'
            : value;
        } 
      ),
    );

    if ( carpeta.ultimaActuacion ) {
      const prismaActuacionInserter = await insertActuacionesInPrisma(
        [ carpeta.ultimaActuacion ],
        numero,
      );
      console.log(
        `${ numero }: actuacionInserter: ${ JSON.stringify(
          prismaActuacionInserter,
          (
            key, value 
          ) => {
            return typeof value === 'bigint'
              ? value.toString() + 'n'
              : value;
          },
          2,
        ) }`,
      );
      fs.writeFile(
        `carpetas/${ numero }/prismaActuacionInserterOutput.json`,
        JSON.stringify(
          prismaActuacionInserter, (
            key, value 
          ) => {
            return typeof value === 'bigint'
              ? value.toString() + 'n'
              : value;
          } 
        ),
      );
    }
  }
}

insertManyCarpetas()
  .then(
    (
      ff 
    ) => {
      console.log(
        ff 
      );
      return ff;
    } 
  )
  .finally(
    () => {
      console.log(
        'finally' 
      );
      return;
    } 
  );
