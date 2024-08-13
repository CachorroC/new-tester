async function fetchDav() {
  const request = await fetch(
    'https://ical.rsasesorjuridico.com/cachorro_cami/0c738be2-9904-e1f0-1fce-40b646ee5390/',
  );
  return request.statusText;
}

console.log(
  fetchDav() 
);
