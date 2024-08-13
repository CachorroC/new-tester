import xlsx from 'xlsx';
import { RawDb } from '../types/raw-db';
import { Category } from '../types/carpetas';

const workbook = xlsx.readFile(
  '/srv/new/nube/bases_de_datos/BASE DE DATOS GENERAL BANCOLOMBIA A 8 DE FEBRERO DE 2024.xlsx',
  {
    cellDates: true,
  },
);

const {
  SheetNames, Sheets 
} = workbook;

const mapperSheets = SheetNames.flatMap(
  (
    sheetname 
  ) => {
    const sheet = Sheets[ sheetname ];

    const tableSheet = xlsx.utils.sheet_to_json<RawDb>(
      sheet, {
        raw      : true,
        blankrows: false,
        header   : 'A',
      } 
    );
    return tableSheet.map(
      (
        table 
      ) => {
        return {
          ...table,
          category: sheetname as Category,
        };
      } 
    );
  } 
);
console.log(
  mapperSheets 
);
