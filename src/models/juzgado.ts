import { Despachos } from '../data/despachos';
import { Juzgado } from '../types/carpetas';
import { intProceso } from '../types/procesos';

export function extrapolateTipoToCorrectType(
  tipo: string
): string {
  let output = tipo;

  const hasEjecucion = /EJE|E/gim.test(
    tipo
  );

  const isPequeñasCausas = /PCCM|PCYCM|Peque/gim.test(
    tipo
  );

  const isPromiscuoMunicipal = /PM|PROM|P M/gim.test(
    tipo
  );

  const isCivilMunicipal = /(CM|municipal|C M)/g.test(
    tipo
  );

  const isCivilCircuito = /(CC|CIRCUITO|CTO)/gim.test(
    tipo
  );

  if ( hasEjecucion ) {
    if ( isCivilMunicipal ) {
      output = 'CIVIL MUNICIPAL DE EJECUCIÓN DE SENTENCIAS';
    } else if ( isCivilCircuito ) {
      output = 'CIVIL DEL CIRCUITO DE EJECUCIÓN DE SENTENCIAS';
    } else if ( isPequeñasCausas ) {
      output = 'DE PEQUEÑAS CAUSAS Y COMPETENCIA MÚLTIPLE';
    } else if ( isPromiscuoMunicipal ) {
      output = 'PROMISCUO MUNICIPAL';
    }
  } else {
    if ( isCivilMunicipal ) {
      output = 'CIVIL MUNICIPAL';
    } else if ( isCivilCircuito ) {
      output = 'CIVIL DEL CIRCUITO';
    } else if ( isPequeñasCausas ) {
      output = 'DE PEQUEÑAS CAUSAS Y COMPETENCIA MÚLTIPLE';
    } else if ( isPromiscuoMunicipal ) {
      output = 'PROMISCUO MUNICIPAL';
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
      this.id = constructorString.slice(
        7, 9
      )
        .padStart(
          3, '000'
        );
      this.tipo = constructorString.slice(
        9
      );

    } else {
      const [
        fullQuery,
        id,
        tipo,
        ciudad
      ] = matchedValues;
      console.log(
        fullQuery
      );
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

        const localeComparedDespachos = normalizedIteratedName.localeCompare(
          normalizedName
        );

        if ( localeComparedDespachos !== -1 ) {
          console.log(
            localeComparedDespachos
          );

        }

        if ( indexOfDespacho !== -1 ) {
          console.log(
            `${ normalizedIteratedName } === ${ normalizedName }: ${ normalizedIteratedName === normalizedName }`
          );
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
        console.log(
          longName
        );
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
        fullArray,
        rawId,
        space,
        rawTipo
      ] = asAnArray;
      console.log(
        fullArray + space
      );
      newId = rawId.padStart(
        3, '000'
      );
      newTipo = extrapolateTipoToCorrectType(
        rawTipo
      );


    }

    return new NewJuzgado(
      `JUZGADO ${ newId } ${ newTipo } DE ${ ciudad }`
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