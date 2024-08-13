const startingDay = 11;

const startingMonthIndex = 3;

const startingYear = 2024;

const startingHour = 8;

const everyXDays = 9;

const startingDate = new Date(
  startingYear,
  startingMonthIndex,
  startingDay,
  startingHour,
);

const endingDate = new Date(
  2026,
  startingMonthIndex,
  startingDay + 9,
  startingHour,
);

const upcomingDate = new Date(
  startingYear,
  startingMonthIndex,
  startingDay + everyXDays,
  startingHour,
);

export function toLocaleDateOutput(
  date: number | Date | undefined 
) {
  return Intl.DateTimeFormat(
    'es-CO', {
      year        : 'numeric',
      month       : 'long',
      day         : '2-digit',
      weekday     : 'long',
      hour        : 'numeric',
      timeZoneName: 'short',
      hour12      : true,
    } 
  )
    .format(
      date 
    );
}

function addDays(
  date: Date, days: number 
) {
  const newDate = new Date(
    date 
  );
  newDate.setDate(
    date.getDate() + days 
  );
  return newDate;
}

console.log(
  toLocaleDateOutput(
    startingDate 
  ) 
);
console.log(
  toLocaleDateOutput(
    upcomingDate 
  ) 
);

const range = {
  from: startingDate,
  to  : endingDate,

  [ Symbol.iterator ]() {
    return {
      current: this.from,
      last   : this.to,

      next() {
        if ( this.current <= this.last ) {
          return {
            done : false,
            value: addDays(
              this.current, 9 
            ),
          };
        }

        return {
          done: true,
        };
      },
    };
  },
};

const waterShortageDaysRange = {
  *[ Symbol.iterator ]() {
    for ( let value = 0; value < array.length; value++ ) {
      const element = array[ value ];
    }
  },
};

for ( const iterator of range ) {
  console.log(
    iterator 
  );
}
