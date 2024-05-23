import { client } from '../models/carpeta-old';
import * as fs from 'fs/promises';

async function getCurrent() {
  return await client.carpeta.findMany(
    {
      include: {
        demandas       : true,
        deudor         : true,
        codeudor       : true,
        procesos       : true,
        juzgados       : true,
        ultimaActuacion: true,
        _count         : true,
        notas          : true,
        tareas         : {
          include: {
            subTareas: true,
          },
        },
        notificacion: {
          include: {
            notifiers: true,
          },
        },
      },
    } 
  );
}

console.log(
  getCurrent()
    .then(
      (
        rr 
      ) => {
        console.log(
          rr 
        );

        const newCarpetasMap = new Map();

        for ( const carpeta of rr ) {
          newCarpetasMap.set(
            carpeta.numero, carpeta 
          );
        }

        const newObjectCarpetas = Object.fromEntries(
          newCarpetasMap 
        );
        fs.writeFile(
          'carpetasObjectCurrent.json',
          JSON.stringify(
            newObjectCarpetas, null, 2 
          ),
        );

        fs.writeFile(
          'carpetasCurrent.json', JSON.stringify(
            rr, null, 2 
          ) 
        );
        return rr;
      } 
    ),
);
