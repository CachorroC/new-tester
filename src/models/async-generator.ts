import { Carpetas } from '../data/carpetas';
import { CarpetaRaw } from '../types/carpetas';
import { NewJudicial } from './newJudicial';

async function* carpetaSequence(
  rawCarpeta: CarpetaRaw
) {
  const newCarpeta = new NewJudicial(
    rawCarpeta
  );
  yield newCarpeta;
  // Wow, can use await!
  await new Promise(
    (
      resolve
    ) => {
      return setTimeout(
        resolve, 1000
      );
    }
  );

  newCarpeta.getProcesos();
  yield newCarpeta;

  await new Promise(
    (
      resolve
    ) => {
      return setTimeout(
        resolve, 1000
      );
    }
  );
  newCarpeta.getActuaciones();
  yield newCarpeta;
}

async function* generateSequence() {
  for await ( const rawCarpeta of Carpetas ) {
    yield carpetaSequence(
      rawCarpeta
    );
  }
}

( async () => {
  for ( const carpeta of Carpetas ) {
    const generator = generateSequence();

    for await ( const value of generator ) {
      console.log(
        value
      ); // 1, then 2, then 3, then 4, then 5 (with delay between)
    }
  }
} )();
