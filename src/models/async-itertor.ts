import { IntCarpeta } from '../types/carpetas';

export function groupBy(
  array: IntCarpeta[], key: 'category' 
) {
  const reduced = array.reduce(
    (
      result: { [x: string]: IntCarpeta[] }, currentValue: IntCarpeta 
    ) => {
      ( result[ currentValue[ key ] ] = result[ currentValue[ key ] ] || [] ).push(
        currentValue,
      );
      console.log(
        result 
      );
      return result;
    },
    {},
  );

  return reduced;
}
