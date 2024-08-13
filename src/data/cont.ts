import xlsx from 'xlsx';
import * as fs from 'fs/promises';
import { Contabilidad } from '../types/contabilidad';

const workbook = xlsx.readFile(
  '/home/cachorro_cami/OneDrive/Contabilidad_2023_2024.xlsx',
);

const {
  SheetNames, Sheets
} = workbook;

for ( const sheet of SheetNames ) {
  console.log(
    sheet
  );

}

export const Carpetas = SheetNames.flatMap(
  (
    sheetname
  ) => {
    const sheet = Sheets[ sheetname ];

    const tableSheet = xlsx.utils.sheet_to_json<Contabilidad>(
      sheet
    );
    return tableSheet.map(
      (
        table
      ) => {
        return {
          ...table,
          category: sheetname
        };
      }
    );
  }
);


fs.writeFile(
  'contabilidad.json', JSON.stringify(
    Carpetas, null, 2
  )
);
