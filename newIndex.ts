import * as fs from 'fs/promises';
import { Carpetas } from './src/data/carpetas';
import { sleep } from './src/models/thenable';
import { categoryAssignment } from './src/models/categories';
import { CarpetaBuilder } from './src/models/carpeta-old';

async function f() {
  const newCarpetasMap = new Map<number, CarpetaBuilder>();

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

    const thener = new CarpetaBuilder(
      carpeta 
    );

    await fs.mkdir(
      `carpetas/${ thener.numero }/`, {
        recursive: true,
      } 
    );
    await thener.getProcesos();
    await thener.getActuaciones();

    const prismaCarpeta = await thener.createPrismaCarpeta();

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
    /*
    await thener.updatePrismaCarpetawithProcesos(); */

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

f()
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
