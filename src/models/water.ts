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

const todayDate = new Date(
  2024, 3, 20 
);

const startingDay = 11;

const startingMonthIndex = 3;

const startingYear = 2024;

const startingHour = 8;

const startingDate = new Date(
  startingYear,
  startingMonthIndex,
  startingDay,
  startingHour,
);

let currentShortageDate = startingDate;

do {
  console.log(
    currentShortageDate 
  );
  currentShortageDate = addDays(
    currentShortageDate, 9 
  );
  console.log(
    currentShortageDate 
  );
} while ( todayDate >= currentShortageDate );
