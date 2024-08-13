import { client } from '../services/prisma';

async function getOwnPropertieNamesCarpetas() {
  const carpetas = await client.carpeta.findMany(
    {
      include: {
        ultimaActuacion: true,
        deudor         : true,
        codeudor       : true,
        notas          : true,
        tareas         : true,
        demanda        : {
          include: {
            notificacion: {
              include: {
                notifiers: true,
              },
            },
            medidasCautelares: true,
          },
        },
        procesos: {
          include: {
            juzgado: true,
          },
        },
      },
    } 
  );

  for ( const carpeta of carpetas ) {
    const propertieNamesOfCarpeta = Object.entries(
      carpeta 
    );

    for ( const propName of propertieNamesOfCarpeta ) {
      console.log(
        propName 
      );
    }
  }
}

console.log(
  getOwnPropertieNamesCarpetas() 
);
