/* eslint-disable @typescript-eslint/no-unused-vars */
import { Despachos } from '../data/despachos';
import { Juzgado } from '../types/carpetas';
import { intProceso } from '../types/procesos';

export function extrapolateTipoToCorrectType(
  tipo: string
): string {
  let output = tipo;

  const hasEjecucion = /EJE|E|EJ/gim.test(
    tipo
  );

  const isPromiscuoCircuito = /PCTO/gim.test(
    tipo
  );

  const isPequeñasCausas = /PCCM|PCYCM|Peque|causas/gim.test(
    tipo
  );

  const isPromiscuoMunicipal = /PM|PROM|P M/gim.test(
    tipo
  );

  const isCivilMunicipal = /(CM|municipal|C M)/g.test(
    tipo
  );

  const isCivilCircuito = /(CCTO|CIRCUITO|CTO|C CTO|CC)/gim.test(
    tipo
  );

  if ( hasEjecucion ) {
    if ( isCivilCircuito ) {
      output = 'CIVIL DEL CIRCUITO DE EJECUCIÓN DE SENTENCIAS';
    } else if ( isPequeñasCausas ) {
      output = 'DE PEQUEÑAS CAUSAS Y COMPETENCIA MÚLTIPLE';
    } else if ( isPromiscuoMunicipal ) {
      output = 'PROMISCUO MUNICIPAL';
    } else if ( isCivilMunicipal ) {
      output = 'CIVIL MUNICIPAL DE EJECUCIÓN DE SENTENCIAS';
    }
  } else {
    if ( isPromiscuoCircuito ) {
      output = 'PROMISCUO DEL CIRCUITO';
    }  else if ( isCivilCircuito ) {
      output = 'CIVIL DEL CIRCUITO';
    } else if ( isPequeñasCausas ) {
      output = 'DE PEQUEÑAS CAUSAS Y COMPETENCIA MÚLTIPLE';
    } else if ( isPromiscuoMunicipal ) {
      output = 'PROMISCUO MUNICIPAL';
    } else if ( isCivilMunicipal ) {
      output = 'CIVIL MUNICIPAL';
    }
  }

  return output;
}

export class NewJuzgado implements Juzgado {
  constructor(
    constructorString: string
  ) {
    const matchedValues = constructorString.match(
      /JUZGADO (\d+) ([A-Z\sñúóéíá]+) DE ([.A-Z\sñúóéíáü-]+)/im,
    );
    this.url = '';

    if ( !matchedValues ) {
      this.id = constructorString.trim()
        .slice(
          7, 9
        )
        .padStart(
          3, '000'
        );
      this.tipo = constructorString.trim()
        .slice(
          9
        );

    } else {
      const [
        fullQuery,
        id,
        tipo,
        ciudad
      ] = matchedValues;

      this.id = id.padStart(
        3, '000'
      );
      this.tipo = tipo;
      this.ciudad = ciudad;
    }



    const [ matchedDespacho ] = Despachos.filter(
      (
        despacho
      ) => {
        const normalizedIteratedName = despacho.nombre
          .toLowerCase()
          .normalize(
            'NFD'
          )
          .replaceAll(
            /\p{Diacritic}/gu, ''
          )
          .trim();

        const normalizedName = constructorString.toLowerCase()
          .normalize(
            'NFD'
          )
          .replaceAll(
            /\p{Diacritic}/gu, ''
          )
          .trim();


        const indexOfDespacho = normalizedIteratedName.indexOf(
          normalizedName
        );

        const includesDespacho = normalizedIteratedName.includes(
          normalizedName
        );

        const includesBuilded = normalizedIteratedName.includes(
          `${ Number(
            this.id
          ) } ${ this.tipo }`.toLowerCase()
            .normalize(
              'NFD'
            )
            .replaceAll(
              /\p{Diacritic}/gu, ''
            )
            .trim()
        );

        if (  indexOfDespacho !== -1 || includesDespacho||includesBuilded  ) {

          return true;
        }

        return normalizedIteratedName === normalizedName;
      }
    );

    if ( matchedDespacho ) {
      this.url = `https://www.ramajudicial.gov.co${ matchedDespacho.url }`;


      const regexNameMatch = matchedDespacho.nombre.match(
        /JUZGADO (\d+) ([A-Z\sñúóéíá]+) de ([.A-Z\sñúóéíá-]+)/mi
      );


      if ( regexNameMatch ) {
        const [
          longName,
          id,
          tipo,
          ciudad
        ] = regexNameMatch;

        this.id = id;
        this.tipo = tipo;
        this.ciudad = ciudad;
      } else {
        this.tipo = matchedDespacho.nombre;
        this.ciudad = matchedDespacho.especialidad;
      }


    }

  }
  ciudad: string = 'Bogota';
  id: string;
  tipo: string;
  url: string;
  static fromShortName(
    {
      ciudad,
      juzgadoRaw
    }: {
      ciudad: string;
      juzgadoRaw: string
    }
  ) {
    let newTipo, newId;
    newTipo = juzgadoRaw;


    const matchedRegexNumberAndLetters = juzgadoRaw.match(
      /(\d+)(\s?)([A-Zñúáéóí\s-]+)/im,
    );


    if ( matchedRegexNumberAndLetters ) {
      const asAnArray = Array.from(
        matchedRegexNumberAndLetters
      );

      const [
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        fullArray,
        rawId,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        space,
        rawTipo
      ] = asAnArray;

      newId = rawId.padStart(
        3, '000'
      );
      newTipo = extrapolateTipoToCorrectType(
        rawTipo
      );


    }

    return new NewJuzgado(
      `JUZGADO ${ newId } ${ newTipo } DE ${ ciudad.toUpperCase()
        .normalize(
          'NFD'
        )
        .replaceAll(
          /\p{Diacritic}/gu, ''
        )
        .trim() }`
    );
  }
  static fromProceso(
    proceso: intProceso
  ) {

    return new NewJuzgado(
      proceso.despacho
    );


  }
}
