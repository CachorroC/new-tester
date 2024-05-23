import * as fs from 'fs/promises';
import xlsx from 'xlsx';
import { RawDb } from '../types/raw-db';
import { NotasBuilder } from '../models/nota';

const workbook = xlsx.readFile(
  '/home/cachorro_cami/OneDrive/bases_de_datos/general.xlsx', {
    cellDates: true,
  }
);

const {
  SheetNames, Sheets
} = workbook;

const mapSheets = new Map();

for ( const sheetname of SheetNames ) {
  const sheet = Sheets[ sheetname ];

  const jsonSheet = xlsx.utils.sheet_to_json(
    sheet
  );
  mapSheets.set(
    sheetname, jsonSheet
  );
}

const mapSheetsArray = Array.from(
  mapSheets.values()
)
  .flat() as RawDb[];

const fechasDePresentacion = mapSheetsArray.map(
  (
    sheet
  ) => {
    return sheet.FECHA_PRESENTACION_DEMANDA;
  }
);

const capitalesAdeudados = mapSheetsArray.map(
  (
    sheet
  ) => {
    return sheet.VALOR_CAPITAL_ADEUDADO;
  }
);

const notas = mapSheetsArray.flatMap(
  (
    sheet
  ) => {
    return [
      sheet.OBSERVACIONES,
      sheet.EXTRA,
      sheet.NUMERO
    ];
  }
);

for ( const nota of notas ) {
  if ( typeof nota === 'string' ) {
    const noter = new NotasBuilder(
      nota
    );
    console.log(
      noter
    );
  }
}

fs.writeFile(
  'fechasDePresentacion.json', JSON.stringify(
    fechasDePresentacion
  )
);
fs.writeFile(
  'capitalesAdeudados.json', JSON.stringify(
    capitalesAdeudados
  )
);
fs.writeFile(
  'notas.json', JSON.stringify(
    notas
  )
);
