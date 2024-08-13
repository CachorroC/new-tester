import { Carpetas } from '../data/carpetas';
import { capitalBuilder } from '../utils/capital-builder';
import * as fs from 'fs/promises';

const avaluos = Carpetas.map(
  (
    carpeta 
  ) => {
    return carpeta.VALOR_AVALUO;
  } 
);
fs.writeFile(
  'avaluos.json', JSON.stringify(
    avaluos 
  ) 
);

const liquidaciones = Carpetas.map(
  (
    carpeta 
  ) => {
    return carpeta.VALOR_LIQUIDACION;
  } 
);
fs.writeFile(
  'liquidaciones.json', JSON.stringify(
    liquidaciones 
  ) 
);

const mapperAvaluos = avaluos.map(
  (
    avaluo 
  ) => {
    return capitalBuilder(
      avaluo 
    );
  } 
);

console.log(
  mapperAvaluos 
);
